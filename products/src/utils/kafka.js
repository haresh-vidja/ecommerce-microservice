import { Kafka, Partitioners, CompressionTypes } from 'kafkajs';
import CONFIG from '../config/index.js'
import { v4 as uuidv4 } from 'uuid';
import { redisSubscribe, redisPublish } from './redis.js';
import Events from '../event/index.js';
import { logger } from './logs.js';
const kafkaLogs = logger.logs('kafka');
import { addShutdownHandler } from './graceful-shutdown.js';
import { wait } from './index.js';


export const init = async function () {
    await createConnection();
    await checkAndCreateTopic();
    await connectProducer();
    serviceConsumer();
    kafkaLogs.info("Broker Kafka connected")
    return;
}

export const createConnection = async function () {
    const kafka = new Kafka({
        clientId: 'my-app',
        // brokers: ['kafka1.nimbusclient.io:9095', 'kafka2.nimbusclient.io:9095', 'kafka3.nimbusclient.io:9095'] //add kafka cluster
        brokers: ['localhost:9092'] //add kafka cluster
    });
    global.kafkaConnection = kafka;
    return kafka;
}

/**
 * This function is used to check and create topic
 * @param {String} topic 
 * @param {Object} kafka 
 * @param {String} serviceName 
 * @returns 
 */
export const checkAndCreateTopic = async function (kafka = kafkaConnection) {
    let config = CONFIG.KAFKA_SERVICE_CONFIG;
    //set kafka admin
    const admin = kafka.admin();
    //connect kafka admin
    await admin.connect();
    try {
        //check for topic metadata
        let topicData = await admin.fetchTopicMetadata({ topics: [config.topic] });
        //disconnect admin
        await admin.disconnect();
        return topicData;
    } catch (error) {
        //if UNKNOWN_TOPIC_OR_PARTITION means topic is not exists
        if (error.type == "UNKNOWN_TOPIC_OR_PARTITION") {
            //create new topic
            let topicData = await admin.createTopics({
                waitForLeaders: false,
                timeout: 10000,
                topics: [config]
            });
            //disconnect admin
            await wait(10000);
            await admin.disconnect();
            return topicData;
        }
        kafkaLogs.error("Error while checkAndCreateTopic", error)
        return false;
    }
}

/**
 * This function is used for consume data
 * @param {String} topic 
 * @param {String} kafka 
 * @param {Function} serviceProcess 
 */
export const serviceConsumer = async function (kafka = kafkaConnection) {
    let groupConfig = CONFIG.KAFKA_CONSUMER_GROUP;
    //update groupId
    groupConfig.groupId += process.env.RUNNING_SERVICE;
    //create consumer
    const consumer = kafka.consumer(groupConfig)
    // connect consumer
    await consumer.connect()
    //subscribe consumer
    await consumer.subscribe({ topic: process.env.RUNNING_SERVICE, fromBeginning: false })
    //start consumer
    await consumer.run({
        eachMessage: async function ({ message }) {
            const { data, event, uniqueId } = JSON.parse(message.value.toString());
            // find agent based on provided method
            let response = await Events[event](data);
            if (uniqueId) {
                await redisPublish(uniqueId, response);
            }
        }
    })

    const { CONNECT, DISCONNECT,CRASH } = consumer.events
    consumer.on(CONNECT, () => {
        console.log("Kafka consumer connected");
    });

    consumer.on(DISCONNECT, () => {
        console.log("Kafka consumer disconnected");
        process.kill(process.pid, "SIGINT");
    });

    consumer.on(CRASH, () => {
        console.log("Kafka consumer crash");
    });

    addShutdownHandler(async () => {
        try {
            await consumer.disconnect()
            console.log('Consumer disconnected')
        } catch (error) {
            console.log('Error in consumer disconnected')
        }
    });
}

/**
 * Function is used for create and connect producer
 * @param {Object} kafka 
 * @returns 
 */
export const connectProducer = async function (kafka = kafkaConnection) {
    //create kafka producer
    const producer = kafka.producer({
        allowAutoTopicCreation: false,
        createPartitioner: Partitioners.LegacyPartitioner
    });
    //connect producer
    await producer.connect();

    const { CONNECT, DISCONNECT } = producer.events
    producer.on(CONNECT, () => {
        console.log("Kafka producer connected");
    });

    producer.on(DISCONNECT, () => {
        console.log("Kafka producer disconnected");
        process.kill(process.pid, "SIGINT");
    });

    global.kafkaProducer = producer;

    addShutdownHandler(async () => {
        try {
            await producer.disconnect()
            console.log('Producer disconnected')
        } catch (error) {
            console.log('Error in producer disconnected')
        }
    });
    return producer;
}

/**
 * This function is used to produce data on topic
 * @param {String} topic 
 * @param {Object} producer 
 * @param {Object} data 
 * @param {String} key 
 * @returns 
 */
export const serviceProducer = async function (topic, data, event, key = null) {
    //create data
    let sendData = {
        uniqueId: uniqueId,
        event: event,
        data: data,
    };
    let producerData = {
        value: JSON.stringify(sendData)
    };
    //set key
    if (key) {
        producerData['key'] = key;
    }
    //produce data
    await kafkaProducer.send({
        topic,
        messages: [producerData],
        compression: CompressionTypes.GZIP,
    });
    return true;
}


export const serviceProducerWait = async function (topic, data, event, key = null) {
    let uniqueId = uuidv4();
    let sendData = {
        uniqueId: uniqueId,
        event: event,
        data: data,
    };
    //create data
    let producerData = {
        value: JSON.stringify(sendData)
    };
    //set key
    if (key) {
        producerData['key'] = key;
    }
    //produce data
    let producerFn = kafkaProducer.send({
        topic,
        messages: [producerData],
        compression: CompressionTypes.GZIP,
    });
    let [cacheData] = await Promise.all([redisSubscribe(uniqueId), producerFn])
    return cacheData;
}