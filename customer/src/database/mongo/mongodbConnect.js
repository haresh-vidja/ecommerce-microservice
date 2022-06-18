import mongoose from 'mongoose'; // Mongoose for MongoDB operations
import { addShutdownHandler } from '../../utils/graceful-shutdown.js'; // Graceful shutdown utility

/**
 * Initializes the MongoDB connection using Mongoose.
 * Handles lifecycle events, errors, and graceful shutdown.
 *
 * @returns {Promise<void>}
 */
export const init = async () => {
    try {
        if (!process.env.DATABASE_URI) {
            throw new Error("DATABASE_URI is not defined in environment variables.");
        }
        // Connect to MongoDB
        await mongoose.connect(process.env.DATABASE_URI);
        
        console.log('MongoDB connected');

        // Handle MongoDB connection close
        mongoose.connection.on('close', () => {
            console.log('MongoDB connection closed');
        });

        // Handle unexpected MongoDB disconnections
        mongoose.connection.on('disconnected', () => {
            console.error('MongoDB disconnected unexpectedly');
            process.kill(process.pid, 'SIGINT'); // Trigger shutdown
        });

        /**
         * Register graceful shutdown handler.
         * Ensures MongoDB is properly disconnected when the process exits.
         */
        addShutdownHandler(async () => {
            try {
                await mongoose.disconnect();
                console.log('MongoDB disconnected gracefully');
            } catch (err) {
                console.error('Error during MongoDB disconnect:', err);
            }
        });

    } catch (error) {
        // Handle initial connection failure
        console.error('MongoDB connection error:', error);
        process.kill(process.pid, 'SIGINT'); // Trigger process shutdown
    }
};
