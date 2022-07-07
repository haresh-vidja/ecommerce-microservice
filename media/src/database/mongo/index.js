import mongoose from 'mongoose'; // Mongoose ODM for MongoDB
import { addShutdownHandler } from '../../utils/graceful-shutdown.js'; // Custom shutdown utility

/**
 * Initializes the MongoDB connection using Mongoose.
 * Enables graceful shutdown, connection monitoring, and debugging.
 */
export const init = async () => {
    try {
        // Attempt connection using URI from environment variables
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('MongoDB connected');

        // Enable debug mode (logs all MongoDB queries)
        mongoose.set('debug', true);

        // Event listeners for connection lifecycle events
        mongoose.connection.on('close', () => {
            console.log('MongoDB connection closed');
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            // Trigger process termination so shutdown handler executes
            process.kill(process.pid, 'SIGINT');
        });

        // Register shutdown logic to close the MongoDB connection cleanly
        addShutdownHandler(async () => {
            try {
                await mongoose.disconnect();
                console.log('MongoDB disconnected gracefully');
            } catch (error) {
                console.error('Error while disconnecting MongoDB during shutdown', error);
            }
        });

    } catch (error) {
        // Log connection errors with details
        console.error('MongoDB connection error:', error);
    }
};
