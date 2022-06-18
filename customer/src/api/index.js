// Import required modules and APIs
import express from 'express';
import customerAPI from './customer.js';
import addressAPI from './address.js';

let status = "404"; // Initial status for status check

// Simulate status change after 50 seconds
setTimeout(() => {
    status = "200";
}, 50000);

/**
 * Initializes the Express app with versioned routing, health checks, and APIs
 * @param {Express.Application} app - The main Express application
 */
export const init = async (app) => {
    const router = express.Router();

    // Mount router under the optional SERVICE_PREFIX if provided
    const prefix = process.env.SERVICE_PREFIX || '';
    app.use(`/${prefix}`, router);

    /**
     * @route GET /<prefix>/whoami
     * @desc Returns service identity for basic health check
     * @access Public
     */
    router.get('/whoami', async (req, res, next) => {
        try {
            res.status(200).send('/customer : I am Customer Service');
        } catch (error) {
            next(error);
        }
    });

    /**
     * @route GET /<prefix>/status/:type?
     * @desc Dynamic status endpoint for service monitoring
     * @access Public
     */
    router.get('/status/:type?', async (req, res, next) => {
        try {
            console.log("status:", status);
            res.status(status).send('/customer : I am Customer Service');
        } catch (error) {
            next(error);
        }
    });

    /**
     * @route GET /<prefix>/us?status=XXX
     * @desc Manual status setter for debugging or chaos testing
     * @access Public
     */
    router.get('/us', async (req, res, next) => {
        try {
            if (req.query.status) {
                status = req.query.status;
            }
            console.log("Updated status:", status);
            res.status(200).send('okay = ' + status);
        } catch (error) {
            next(error);
        }
    });

    // Register business APIs under this router
    customerAPI(router); // Customer-related routes
    addressAPI(router);  // Address-related routes

    /**
     * Global fallback for unknown routes (404)
     */
    app.use((req, res, next) => {
        res.status(404);

        // Respond with JSON if client accepts it
        if (req.accepts('json')) {
            return res.json({ error: 'Not found' });
        }

        // Fallback to plain text
        res.type('txt').send('Not found');
    });
};
