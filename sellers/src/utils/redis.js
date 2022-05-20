import { createClient } from "redis";
import { addShutdownHandler } from './graceful-shutdown.js';

// Create a Redis client with reconnect strategy
const client = createClient({
    url: process.env.REDIS_URI,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                process.kill(process.pid, "SIGINT"); // Force shutdown after 10 retries
                return false;
            }
            return 2000; // Retry after 2 seconds
        }
    }
});

// Connect to Redis
await client.connect();

// Redis event listeners for lifecycle tracking
client.on('ready', () => console.log('Redis connected'));
client.on('end', () => console.log('Redis disconnected'));
client.on('reconnecting', () => console.log('Redis reconnecting...'));
client.on('error', (error) => console.error('Redis error:', error));

// Ensure Redis is gracefully closed on app shutdown
addShutdownHandler(async () => {
    if (client.isOpen) {
        await client.quit();
    }
});

/**
 * Subscribe to a Redis channel and return the first message.
 *
 * @param {string} channel - Redis pub/sub channel
 * @returns {Promise<Object>} - The received message
 */
export const redisSubscribe = async function (channel) {
    return new Promise(async (resolve) => {
        const subscriber = client.duplicate();
        await subscriber.connect();

        subscriber.subscribe(channel, async (message) => {
            resolve({ message });
            await subscriber.unsubscribe(channel); // Stop listening after one message
        });
    });
};

/**
 * Publish a message to a Redis channel.
 *
 * @param {string} channel - Target channel
 * @param {Object} data - Data to publish
 * @returns {boolean}
 */
export const redisPublish = async function (channel, data) {
    await client.publish(channel, JSON.stringify(data));
    return true;
};

/**
 * Store an object in Redis using HSET.
 *
 * @param {string} redisKey - Redis hash key
 * @param {Object} value - Object to store
 * @param {number|null} expiry - Expiration time in minutes (optional)
 */
export const hSet = async function (redisKey, value, expiry = null) {
    const flatData = Object.entries(value).flat();
    const response = await client.HSET(redisKey, flatData);

    if (expiry) {
        await client.EXPIRE(redisKey, expiry * 60); // Convert minutes to seconds
    }

    return response;
};

/**
 * Retrieve a specific field from a Redis hash.
 *
 * @param {string} redisKey
 * @param {string} field
 * @returns {Promise<string|null>}
 */
export const hGet = async function (redisKey, field) {
    return await client.HGET(redisKey, field);
};

/**
 * Retrieve all fields from a Redis hash.
 *
 * @param {string} redisKey
 * @returns {Promise<Object>}
 */
export const hGetAll = async function (redisKey) {
    return await client.HGETALL(redisKey);
};

/**
 * Add one or more values to a Redis set.
 *
 * @param {string} redisKey
 * @param {Array|string} value
 * @param {number|null} expiry - Expiration in minutes (optional)
 * @returns {Promise<number>}
 */
export const sAdd = async function (redisKey, value, expiry = null) {
    const response = await client.SADD(redisKey, value);
    if (expiry) {
        await client.EXPIRE(redisKey, expiry * 60);
    }
    return response;
};

/**
 * Remove one or more values from a Redis set.
 *
 * @param {string} redisKey
 * @param {Array|string} value
 * @param {number|null} expiry - Expiration in minutes (optional)
 * @returns {Promise<number>}
 */
export const sRem = async function (redisKey, value, expiry = null) {
    const response = await client.SREM(redisKey, value);
    if (expiry) {
        await client.EXPIRE(redisKey, expiry * 60);
    }
    return response;
};

/**
 * Retrieve all members from a Redis set.
 *
 * @param {string} redisKey
 * @returns {Promise<Array>}
 */
export const sMembers = async function (redisKey) {
    return await client.SMEMBERS(redisKey);
};

/**
 * Delete a Redis key.
 *
 * @param {string} redisKey
 * @returns {Promise<number>} - Number of keys deleted
 */
export const del = async function (redisKey) {
    return await client.DEL(redisKey);
};

/**
 * Delete a specific field from a Redis hash.
 *
 * @param {string} redisKey
 * @param {string} field
 * @returns {Promise<number>}
 */
export const hDel = async function (redisKey, field) {
    return await client.HDEL(redisKey, field);
};
