import express from 'express';          // Import Express framework
import morgan from 'morgan';            // HTTP request logger middleware
import { logger } from './logs.js';     // Application-wide logger utility

const appLog = logger.logs('customer-service'); // Tagged logger for this service

/**
 * Initializes the Express application.
 * - Sets up middleware (JSON parser, logger)
 * - Starts server on configured port
 * - Logs server startup and handles startup errors
 *
 * @returns {Promise<{server: import('http').Server, app: import('express').Express}>}
 */
export const init = async () => {
    // Create Express app
    const app = express();

    // Middleware to parse JSON bodies
    app.use(express.json());

    // Request logging (in 'dev' format: method, URL, status, response time)
    app.use(morgan('dev'));

    // Determine port from environment or fallback to 80
    const port = process.env.PORT || 80;

    // Start the server and return app + server
    const server = app.listen(port, () => {
        appLog.info(`Server listening on port ${port}`);
    });

    // Catch startup errors
    server.on('error', (err) => {
        appLog.error('Server startup failed:', err);
        process.exit(1); // Exit with failure
    });

    return { server, app };
};
