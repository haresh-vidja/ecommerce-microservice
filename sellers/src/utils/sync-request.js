import Events from '../event/index.js';               // Event handler map
import axios from 'axios';                            // HTTP client for sync requests
import HOST from '../config/service-host.js';         // Microservice host mapping
import { logger } from './logs.js';                   // Logging utility

const syncRequestLog = logger.logs('sync-request');   // Scoped logger for sync requests

/**
 * Middleware to validate internal service-to-service token.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
const verifySyncRequest = (req, res, next) => {
    if (req.headers.token === process.env.INTERNAL_TOKEN) {
        return next();
    }
    return res.status(403).json({ type: 'error', message: 'Invalid Token' });
};

/**
 * Initializes the event-sync listener on the Express app.
 * Handles internal service events by mapping dynamic `:event` routes to handlers.
 *
 * @param {import('express').Express} app - Express application instance
 */
export const init = (app) => {
    syncRequestLog.info('Sync request listener initialized');

    app.use('/app-events/:event', verifySyncRequest, async (req, res, next) => {
        const { event } = req.params;

        try {
            const handler = Events[event];

            if (typeof handler !== 'function') {
                syncRequestLog.warn(`Unknown sync event requested: ${event}`);
                return res.status(404).json({ type: 'error', message: 'Unknown event' });
            }

            const response = await handler(req.body);
            return res.json(response);
        } catch (error) {
            syncRequestLog.error(`Error handling sync event: ${event}`, error);
            next(error);  // Let Express handle error response
        }
    });
};

/**
 * Sends a synchronous HTTP request to another service's `/app-events/:event` endpoint.
 *
 * @param {string} service - Service key (must match key in HOST config)
 * @param {string} event - Event name to trigger remotely
 * @param {object} data - Request body payload
 * @returns {Promise<object>} - Response data or error object
 */
export const syncRequest = async (service, event, data = {}) => {
    try {
        const response = await axios.post(
            `${HOST[service]}/app-events/${event}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'token': process.env.INTERNAL_TOKEN
                }
            }
        );

        return response.data;
    } catch (error) {
        syncRequestLog.error(`Failed sync request to ${service}/${event}`, {
            message: error.message,
            stack: error.stack
        });

        return { type: 'error', message: 'Internal sync request failed' };
    }
};
