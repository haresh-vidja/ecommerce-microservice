import express from 'express';                 // Express framework
import morgan from 'morgan';                   // HTTP request logger middleware
import { logger } from './logs.js';            // Custom logging utility

const appLog = logger.logs('seller-service');  // Scoped logger for this service

/**
 * Initializes an Express application with basic middleware and starts the HTTP server.
 *
 * @returns {Promise<{ app: Express.Application, server: http.Server }>}
 */
export const init = async () => {
  // Create a new Express app instance
  const app = express();

  // Parse incoming JSON requests
  app.use(express.json());

  // Log HTTP requests using Morgan in 'dev' format
  app.use(morgan('dev'));

  // Define the port (fallback to 80 if not specified)
  const PORT = process.env.PORT || 80;

  // Start the server and listen for incoming connections
  const server = app.listen(PORT, () => {
    appLog.info(`Server is listening on port ${PORT}`);
  }).on('error', (err) => {
    appLog.error('Failed to start server:', err);
    process.exit(1); // Exit on fatal error
  });

  // Return app and server instances for external access
  return { server, app };
};
