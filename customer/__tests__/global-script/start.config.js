// Load environment variables
import '../../src/config/env.js';

// Import the GenericContainer from testcontainers to spin up a Redis container for the test environment
import { GenericContainer } from 'testcontainers';
import { MongoDBContainer } from '@testcontainers/mongodb';

export default async () => {
    // Start a Redis container for testing purposes, exposing port 6379 for Redis
    const redisContainer = await new GenericContainer('redis:5-stretch').withExposedPorts(6379).start();
    // Get the mapped port for Redis
    const redisPort = redisContainer.getMappedPort(6379);
    // Get the host for Redis
    const redisHost = redisContainer.getHost();
    // Set the Redis URI in the environment variables
    process.env.REDIS_URI = `redis://${redisHost}:${redisPort}`;

    const mongodbContainer = await new MongoDBContainer('mongo:6.0.1').start();

    process.env.MONGODB_URI = `${mongodbContainer.getConnectionString()}?directConnection=true`;

    
}