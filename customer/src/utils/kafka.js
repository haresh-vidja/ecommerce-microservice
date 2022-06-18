// Import required modules and dependencies
import { Kafka, Partitioners, CompressionTypes } from 'kafkajs';         // Kafka client from kafkajs
import CONFIG from '../config/index.js';                                 // Kafka config constants
import { v4 as uuidv4 } from 'uuid';                                     // For generating unique request IDs
import { redisSubscribe, redisPublish } from './redis.js';              // Redis pub/sub functions
import Events from '../event/index.js';                                  // Map of event handlers
import { logger } from './logs.js';                                      // Logger utility
import { addShutdownHandler } from './graceful-shutdown.js';            // Shutdown hook registration
import { wait } from './wait.js';                                        // Delay utility

const kafkaLogs = logger.logs('kafka');                                  // Tagged logger for Kafka-related logs

/**
 * Custom log handler to route KafkaJS logs to your app logger
 */
const logCreator = () => ({ log }) => {
  const { message, ...extra } = log;
  kafkaLogs.info(extra);
};

/**
 * Initializes the Kafka connection, topics, producer, and consumer.
 * Entry point for setting up the Kafka service for your app.
 */
export const init = async () => {
  await createConnection();         // Establish Kafka client connection
  await checkAndCreateTopic();      // Ensure the configured topic exists
  await connectProducer();          // Setup Kafka producer
  await serviceConsumer();          // Setup Kafka consumer
  kafkaLogs.info('✅ Kafka broker initialized.');
};

/**
 * Creates and stores a Kafka connection globally.
 */
export const createConnection = async () => {
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'],  // Replace with your Kafka broker address(es)
    logCreator: logCreator
  });
  global.kafkaConnection = kafka;
  return kafka;
};

/**
 * Checks if the topic exists, creates it if it does not.
 */
export const checkAndCreateTopic = async (kafka = kafkaConnection) => {
  const config = CONFIG.KAFKA_SERVICE_CONFIG;
  const admin = kafka.admin();
  await admin.connect();

  try {
    // Attempt to fetch metadata for the configured topic
    const metadata = await admin.fetchTopicMetadata({ topics: [config.topic] });
    await admin.disconnect();
    return metadata;
  } catch (error) {
    // If topic doesn't exist, create it
    if (error.type === 'UNKNOWN_TOPIC_OR_PARTITION') {
      await admin.createTopics({
        waitForLeaders: false,
        timeout: 10000,
        topics: [config]
      });
      await wait(10000); // Wait for topic registration
      await admin.disconnect();
      return true;
    }

    kafkaLogs.error('Error in checkAndCreateTopic', error);
    await admin.disconnect();
    return false;
  }
};

/**
 * Initializes Kafka consumer to listen for messages on the configured topic.
 */
export const serviceConsumer = async (kafka = kafkaConnection) => {
  const groupConfig = {
    ...CONFIG.KAFKA_CONSUMER_GROUP,
    groupId: `${CONFIG.KAFKA_CONSUMER_GROUP.groupId}-${process.env.RUNNING_SERVICE}`
  };

  const consumer = kafka.consumer(groupConfig);
  const { CONNECT, DISCONNECT, CRASH, GROUP_JOIN } = consumer.events;

  // Log important consumer events
  consumer.on(CONNECT, () => kafkaLogs.info('Kafka consumer connected.'));
  consumer.on(GROUP_JOIN, () => kafkaLogs.info('Kafka joined consumer group.'));
  consumer.on(DISCONNECT, () => {
    kafkaLogs.warn('Kafka consumer disconnected.');
    process.kill(process.pid, 'SIGINT');  // Force graceful shutdown
  });
  consumer.on(CRASH, () => kafkaLogs.error('Kafka consumer crashed.'));

  await consumer.connect();
  await consumer.subscribe({ topic: process.env.RUNNING_SERVICE, fromBeginning: false });

  // Message handler
  await consumer.run({
    eachMessage: async ({ message }) => {
      const { data, event, uniqueId } = JSON.parse(message.value.toString());

      const handler = Events[event];
      if (typeof handler === 'function') {
        const response = await handler(data);
        if (uniqueId) {
          await redisPublish(uniqueId, response);  // Send response via Redis if request is tracked
        }
      } else {
        kafkaLogs.warn(`Unknown event type received: ${event}`);
      }
    }
  });

  // Add shutdown logic
  addShutdownHandler(async () => {
    await consumer.disconnect();
    kafkaLogs.info('Consumer disconnected on shutdown.');
  });
};

/**
 * Connects a Kafka producer and stores it globally for reuse.
 */
export const connectProducer = async (kafka = kafkaConnection) => {
  const producer = kafka.producer({
    allowAutoTopicCreation: false,
    createPartitioner: Partitioners.LegacyPartitioner
  });

  const { CONNECT, DISCONNECT } = producer.events;

  producer.on(CONNECT, () => kafkaLogs.info('Kafka producer connected.'));
  producer.on(DISCONNECT, () => {
    kafkaLogs.warn('Kafka producer disconnected.');
    process.kill(process.pid, 'SIGINT'); // Trigger shutdown
  });

  await producer.connect();
  global.kafkaProducer = producer;

  addShutdownHandler(async () => {
    await producer.disconnect();
    kafkaLogs.info('Producer disconnected on shutdown.');
  });

  return producer;
};

/**
 * Sends a Kafka message (fire-and-forget).
 *
 * @param {string} topic - Kafka topic name
 * @param {Object} data - Payload data
 * @param {string} event - Event type identifier
 * @param {string|null} key - Optional message key
 */
export const serviceProducer = async (topic, data, event, key = null) => {
  const sendData = {
    uniqueId: uuidv4(),
    event,
    data
  };

  const producerData = {
    value: JSON.stringify(sendData)
  };

  if (key) producerData.key = key;

  await kafkaProducer.send({
    topic,
    messages: [producerData],
    compression: CompressionTypes.GZIP
  });

  return true;
};

/**
 * Sends a Kafka message and waits for a response via Redis.
 * Useful for request-response messaging.
 *
 * @param {string} topic - Kafka topic name
 * @param {Object} data - Payload
 * @param {string} event - Event type
 * @param {string|null} key - Optional message key
 * @returns {Promise<Object>} Response data from Redis
 */
export const serviceProducerWait = async (topic, data, event, key = null) => {
  const uniqueId = uuidv4(); // Unique identifier for tracking response

  const sendData = {
    uniqueId,
    event,
    data
  };

  const producerData = {
    value: JSON.stringify(sendData)
  };

  if (key) producerData.key = key;

  const producerFn = kafkaProducer.send({
    topic,
    messages: [producerData],
    compression: CompressionTypes.GZIP
  });

  // Wait for Redis response and Kafka delivery
  const [response] = await Promise.all([
    redisSubscribe(uniqueId),
    producerFn
  ]);

  return response;
};
