import express from 'express';       // Express framework for creating the HTTP server
import morgan from 'morgan';         // HTTP request logger middleware
import { logger } from './logs.js';  // Custom logging utility

// Initialize a scoped logger for seller-service
const appLog = logger.logs('seller-service');

/**
 * Initializes and starts an Express server.
 * - Sets up basic middleware (JSON parsing and logging)
 * - Binds the server to the defined port
 * - Returns the app and server instance for further setup
 *
 * @returns {Promise<{server: Server, app: Express}>} Express app and HTTP server
 */
export const init = async () => {
  // Create a new Express app instance
  const app = express();

  // Middleware to parse incoming JSON payloads
  app.use(express.json());

  // Middleware to log HTTP requests in development-friendly format
  app.use(morgan('dev'));

  // Start the HTTP server on the defined PORT
  const server = app.listen(process.env.PORT || 80, () => {
    appLog.info(`✅ Server is listening on port ${process.env.PORT || 80}`);
  });

  // Handle server startup errors
  server.on('error', (err) => {
    appLog.error('❌ Server failed to start:', err);
    process.exit(1); // Exit the process on startup failure
  });

  // Return both app and server to allow further setup (e.g., routes, shutdown handling)
  return { server, app };
};
