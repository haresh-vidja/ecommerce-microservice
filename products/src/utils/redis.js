import { createClient } from "redis";
import { addShutdownHandler } from './graceful-shutdown.js';
const client = createClient({
    url: process.env.REDIS_URI,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                process.kill(process.pid, "SIGINT");
                return false;
            } else {
                return 2000;
            }
        }
    }
});

await client.connect();

client.on('ready', () => {
    console.log('Redis connected');
});

client.on('end', () => {
    console.log('Redis disconnected');
});

client.on('reconnecting', () => {
    console.log('Redis reconnecting');
});

client.on('error', (error) => {
    console.log('Error in redis connection', error);
});

//add logic for shutdown
addShutdownHandler(async () => {
    if (client.isOpen) {
        client.quit();
    }
});

export const redisSubscribe = function (channel) {
    return new Promise(async (resolve) => {
        const subscriber = client.duplicate();
        subscriber.connect();
        subscriber.subscribe(channel, async (message, channelName) => {
            resolve({ message });
            await subscriber.unsubscribe(channel);
        })
    })
};

export const redisPublish = async function (channel, data) {
    client.publish(channel, JSON.stringify(data));
    return true;
};


export const hSet = async function (redisKey, value, expiry = null) {
    //create array from object
    let resultArray = JSON.stringify(value).slice(1, -1).replace(/["]/g, '').split(/[,:]+/);
    //store data in redis
    let response = await client.HSET(redisKey, resultArray);
    //set expiry if found
    if (expiry) {
        await client.EXPIRE(redisKey, expiry * 60);
    }
    return response
};
/**
 * This function is used for get specific field of key
 * @param {String} redisKey 
 * @param {String} key 
 * @returns String
 */
export const hGet = async function (redisKey, key) {
    //get data from redis
    return await client.HGET(redisKey, key);
};
/**
 * This function is used for get all field of key
 * @param {String} redisKey 
 * @returns Object
 */
export const hGetAll = async function (redisKey) {
    //get data from redis
    return await client.HGETALL(redisKey);
};
/**
 * Function is used to store array in redis
 * @param {String} redisKey 
 * @param {Array} value 
 * @param {Integer} expiry 
 * @returns 
 */
export const sAdd = async function (redisKey, value, expiry = null) {
    //store data in redis
    let response = await client.SADD(redisKey, value);
    //set expiry if found
    if (expiry) {
        await client.EXPIRE(redisKey, expiry * 60);
    }
    return response
};
/**
 * Function is used to remove the value from array in redis
 * @param {String} redisKey 
 * @param {Array} value 
 * @param {Integer} expiry 
 * @returns 
 */
export const sRem = async function (redisKey, value, expiry = null) {
    //remove the data in redis
    let response = await client.SREM(redisKey, value);
    //set expiry if found
    if (expiry) {
        await client.EXPIRE(redisKey, expiry * 60);
    }
    return response
};
/**
 * Get array from redis
 * @param {String} redisKey 
 * @returns 
 */
export const sMembers = async function (redisKey) {
    //store data in redis
    return await client.SMEMBERS(redisKey);
};

export const del = async function (redisKey) {
    //store data in redis
    return await client.DEL(redisKey);
};

export const hDel = async function (redisKey, field) {
    //store data in redis
    return await client.HDEL(redisKey, field);
};