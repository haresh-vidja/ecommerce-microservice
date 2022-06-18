// Import Jest test utilities and MongoMemoryServer for in-memory MongoDB
import { beforeAll, afterAll } from '@jest/globals';

import mongoose from 'mongoose';

beforeAll(async () => {
    // Connect to the in-memory database
    await mongoose.connect(process.env.MONGODB_URI);
});

// After all tests, clean up by disconnecting from MongoDB and stopping the in-memory server
afterAll(async () => {
    // Disconnect from MongoDB
    await mongoose.disconnect();
});