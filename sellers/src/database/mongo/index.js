import mongoose from 'mongoose';                     // MongoDB ORM
import { addShutdownHandler } from '../../utils/graceful-shutdown.js';

/**
 * Initializes MongoDB connection using Mongoose.
 * Automatically registers graceful shutdown and event logging.
 */
export const init = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri);

    mongoose.set('debug', true);

    console.log('MongoDB connected');

    // Connection events
    mongoose.connection.on('close', () => {
      console.log('MongoDB connection closed');
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected unexpectedly');
      process.kill(process.pid, "SIGINT"); // Gracefully shut down app
    });

    // Register graceful shutdown handler
    addShutdownHandler(async () => {
      try {
        await mongoose.disconnect();
        console.log('MongoDB disconnected cleanly during shutdown');
      } catch (error) {
        console.error('Error disconnecting MongoDB:', error);
      }
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.kill(process.pid, "SIGINT");
  }
};
