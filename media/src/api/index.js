import express from 'express';
import mediaAPI from './media.js';
import path from 'path';

const __dirname = path.resolve();

/**
 * Initializes and configures the Media Service routes, static paths, and error handling.
 * 
 * @param {Express.Application} app - The Express application instance.
 */
export const init = async (app) => {

    // =============================================
    // Serve Static Files for Profile and Service Media
    // =============================================

    const servicePrefix = `/${process.env.SERVICE_PREFIX}`;

    // Serve profile media from /public/profile and /public/temp
    app.use(`${servicePrefix}/get/profile`, express.static(path.join(__dirname, 'public/profile')));
    app.use(`${servicePrefix}/get/profile`, express.static(path.join(__dirname, 'public/temp')));

    // Serve service-related media from /public/service and /public/temp
    app.use(`${servicePrefix}/get/service`, express.static(path.join(__dirname, 'public/service')));
    app.use(`${servicePrefix}/get/service`, express.static(path.join(__dirname, 'public/temp')));

    // =============================================
    // Initialize API Router with Service Prefix
    // =============================================

    const router = express.Router();
    app.use(servicePrefix, router);

    // =============================================
    // Health Check Endpoint
    // =============================================

    router.get('/whoami', async (req, res, next) => {
        try {
            return res.status(200).send('/media : I am Media Service');
        } catch (error) {
            next(error); // Delegate to global error handler
        }
    });

    // =============================================
    // Register Media API Routes
    // =============================================

    mediaAPI(router);

    // =============================================
    // 404 Error Handling for Undefined Routes
    // =============================================

    app.use((req, res, next) => {
        res.status(404);

        // Respond with JSON if accepted
        if (req.accepts('json')) {
            return res.json({ error: 'Not found' });
        }

        // Fallback to plain text
        res.type('txt').send('Not found');
    });
};
