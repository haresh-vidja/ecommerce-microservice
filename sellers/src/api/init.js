import express from 'express';
import sellerAPI from './seller.js';
import roleAPI from './role.js';

/**
 * Initializes the API routes with the configured service prefix.
 *
 * @param {Express.Application} app - The Express application instance.
 */
export const init = async (app) => {
    const router = express.Router();

    // Mount all routes under the service prefix (e.g., /customer or /seller)
    const prefix = process.env.SERVICE_PREFIX;
    if (prefix) {
        app.use(`/${prefix}`, router);
    }

    /**
     * Health check endpoint
     * @route GET /<SERVICE_PREFIX>/whoami
     */
    router.get('/whoami', async (req, res, next) => {
        try {
            return res.status(200).send(`/${prefix} : I am ${prefix.replace('_', ' ')} service`);
        } catch (error) {
            next(error);
        }
    });

    // Register feature modules (seller, role, etc.)
    sellerAPI(router);
    roleAPI(router);

    /**
     * 404 Handler for unmatched routes
     */
    app.use((req, res) => {
        res.status(404);

        if (req.accepts('json')) {
            return res.json({ error: 'Not found' });
        }

        res.type('txt').send('Not found');
    });
};
