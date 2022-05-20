import amqplib from 'amqplib';                              // RabbitMQ client
import Events from '../event/index.js';                     // Event-handler map
import { logger } from './logs.js';                          // Custom logger
import { addShutdownHandler } from './graceful-shutdown.js'; // Graceful shutdown hook

const brokerLogs = logger.logs('broker');                   // Namespaced logger

/**
 * Initializes RabbitMQ broker: connects, creates channel, and sets up consumer.
 */
export const init = async () => {
    await createConnection();   // Connect to RabbitMQ and set up channel
    await serviceConsumer();    // Start listening to messages
    brokerLogs.info('RabbitMQ broker initialized');
};

/**
 * Creates and stores a connection/channel with RabbitMQ.
 * Also registers shutdown hooks to clean up on exit.
 *
 * @returns {Promise<amqplib.Channel>}
 */
export const createConnection = async () => {
    try {
        const connection = await amqplib.connect(process.env.MSG_QUEUE_URL);
        brokerLogs.info('RabbitMQ connection established');

        connection.on('error', (err) => {
            brokerLogs.error('RabbitMQ connection error:', err);
            throw err;
        });

        connection.on('close', () => {
            brokerLogs.warn('RabbitMQ connection closed');
            process.kill(process.pid, 'SIGINT');
        });

        const channel = await connection.createChannel();

        await channel.assertExchange(process.env.EXCHANGE_NAME, 'direct', { durable: true });

        channel.on('close', () => {
            brokerLogs.warn('RabbitMQ channel closed');
        });

        // Register cleanup on shutdown
        addShutdownHandler(async () => {
            try {
                if (channel && channel.connection && !channel.connection.stream.destroyed) {
                    await channel.close();
                }
                if (connection && !connection.connection.stream.destroyed) {
                    await connection.close();
                }
                brokerLogs.info('RabbitMQ resources closed cleanly');
            } catch (err) {
                brokerLogs.error('Error closing RabbitMQ resources:', err);
            }
        });

        global.brokerChannel = channel;
        return channel;

    } catch (err) {
        brokerLogs.error('Failed to connect to RabbitMQ:', err);
        throw err;
    }
};

/**
 * Publishes an event message to a specific service queue via the shared exchange.
 *
 * @param {string} service - Target service name (used as routing key).
 * @param {string} event - Event type/name.
 * @param {object} [data={}] - Event payload.
 */
export const serviceProducer = (service, event, data = {}) => {
    if (!global.brokerChannel) {
        throw new Error('RabbitMQ channel is not initialized');
    }

    const message = Buffer.from(JSON.stringify({ event, data }));

    global.brokerChannel.publish(
        process.env.EXCHANGE_NAME,
        service,
        message
    );

    brokerLogs.info(`Message sent to [${service}]`, { event, data });
};

/**
 * Subscribes to messages for the current service and dispatches them to the mapped event handlers.
 */
export const serviceConsumer = async () => {
    try {
        const channel = global.brokerChannel;
        if (!channel) throw new Error('RabbitMQ channel not available');

        // Ensure exchange exists
        await channel.assertExchange(process.env.EXCHANGE_NAME, 'direct', { durable: true });

        // Declare a temporary queue for this service
        const { queue } = await channel.assertQueue('', { exclusive: true });

        // Bind the queue to the exchange using the service name as the routing key
        await channel.bindQueue(queue, process.env.EXCHANGE_NAME, process.env.RUNNING_SERVICE);

        brokerLogs.info(`🕸️ Listening on queue [${queue}] for service: ${process.env.RUNNING_SERVICE}`);

        // Start consuming messages
        channel.consume(
            queue,
            (msg) => {
                if (!msg?.content) return;

                try {
                    const { event, data } = JSON.parse(msg.content.toString());
                    brokerLogs.info(`Received event: ${event}`, data);

                    const handler = Events[event];
                    if (typeof handler === 'function') {
                        handler(data);
                    } else {
                        brokerLogs.warn(`No handler defined for event: ${event}`);
                    }
                } catch (err) {
                    brokerLogs.error('Error handling message:', err);
                }
            },
            { noAck: true } // Auto-acknowledge
        );

    } catch (error) {
        brokerLogs.error('Failed to set up RabbitMQ consumer:', error);
    }
};
