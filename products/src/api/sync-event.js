import Events from '../event/index.js';  // Import the Events object that contains event handlers
import { verifySyncRequest } from './middlewares/index.js';  // Import middleware for verifying synchronous requests

// Export a function that sets up routes on the provided Express 'app' instance
export default (app) => {
    // Route handler for '/app-events/:event'
    app.use('/app-events/:event', verifySyncRequest, async (req, res, next) => {
        try {
            // Invoke the appropriate event handler from the Events object based on the 'event' parameter
            const response = await Events[req.params.event](req.body);
            // Send the response back as JSON
            res.json(response);
        } catch (error) {
            // If an error occurs during event handling, pass it to the error handler middleware
            next(error);
        }
    });
};
