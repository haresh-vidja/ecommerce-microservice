import amqplib from 'amqplib';  // Import amqplib for RabbitMQ interactions
import Events from '../event/index.js';  // Import event handlers
import { logger } from './logs.js';  // Import logging utility
import { addShutdownHandler } from './graceful-shutdown.js';

const brokerLogs = logger.logs('broker');  // Initialize a logger for broker operations

export const init = async () => {
    await createConnection()
    serviceConsumer();
    brokerLogs.info("Broker RabbitMQ connected")
    return
}

// Function to create a channel for message brokering
export const createConnection = async () => {
    try {
        // Connect to the message queue
        const connection = await amqplib.connect(process.env.MSG_QUEUE_URL);
        connection.on('error', function (err) {
            brokerLogs.error('Error in connection', err);
            throw err;
        });

        connection.on('close', function (err) {
            console.log("RabbitMQ connection closed");
            if (err) {
                process.kill(process.pid, 'SIGINT');
            }
        });
        // Create a channel
        const channel = await connection.createChannel();
        // Assert a queue to ensure it exists
        await channel.assertQueue(process.env.EXCHANGE_NAME, "direct", { durable: true });

        channel.on('close', function (err) {
            console.log("RabbitMQ channel connection closed");
        });

        addShutdownHandler(async () => {
            try {
                await channel.close();
                await connection.close();
            } catch (error) {
                console.log("Error in close rabbitMQ connection");
            }
        });
        //set connection in global
        global.brokerChannel = channel;
        return channel;  // Return the created channel
    } catch (err) {
        // Log and throw error if connection fails
        brokerLogs.error('Error in connection', err);
        throw err;
    }
};

// Function to publish a message to a specified service
export const serviceProducer = (service, event, data = {}) => {
    // Publish the message to the exchange with the service as the routing key
    brokerChannel.publish(process.env.EXCHANGE_NAME, service, Buffer.from(JSON.stringify({ event, data })));
    // Log the published message details
    brokerLogs.info('Message sent:', service, event);
};

// Function to subscribe to messages from the message queue
export const serviceConsumer = async () => {
    try {
        // Assert the exchange to ensure it exists
        await brokerChannel.assertExchange(process.env.EXCHANGE_NAME, "direct", { durable: true });
        // Assert a queue with a unique name for this subscriber
        const q = await brokerChannel.assertQueue("", { exclusive: true });
        // Log the queue and exchange details
        brokerLogs.info('Waiting for messages in queue:', q.queue, process.env.EXCHANGE_NAME);

        // Bind the queue to the exchange with the specified routing key
        brokerChannel.bindQueue(q.queue, process.env.EXCHANGE_NAME, process.env.RUNNING_SERVICE);

        // Consume messages from the queue
        brokerChannel.consume(
            q.queue,
            (message) => {
                if (message.content) {
                    // Parse and log the received message
                    const { event, data } = JSON.parse(message.content);
                    brokerLogs.info('Message received:', event, data);
                    // Invoke the event handler with the message data
                    Events[event](data);
                }
            },
            {
                noAck: true,  // Acknowledge messages automatically
            }
        );
    } catch (error) {
        // Log any errors that occur during subscription
        brokerLogs.error('Subscriber error', error, ':critical:');
    }
};
