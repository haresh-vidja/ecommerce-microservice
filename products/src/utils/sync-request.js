import Events from '../event/index.js';  // Import the Events object that contains event handlers
import axios from 'axios';  // Import Axios for making HTTP requests
import HOST from '../config/service-host.js';  // Import the host configuration for services
import { logger } from './logs.js';  // Import logging utility
const syncRequestLog = logger.logs('sync-request');  // Initialize a logger for sync requests

const verifySyncRequest = (req, res, next) => {
    if (req.headers.token == process.env.INTERNAL_TOKEN) {
        // If the request has a valid internal token, proceed to the next middleware/route handler
        return next();
    }
    // If the token is invalid, respond with a JSON object indicating an error
    return res.json({ type: "error", message: "Invalid Token" });
}

// Export a function that sets up routes on the provided Express 'app' instance
export const init = (app) => {
    syncRequestLog.info('Sync request started')
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

// Function to make a synchronous request to a specified service
export const syncRequest = async (service, event, data = {}) => {
    try {
        // Send a POST request to the specified service and event endpoint
        const result = await axios.post(`${HOST[service]}/app-events/${event}`, data, {
            headers: {
                "Content-Type": "application/json",  // Set content type to JSON
                "token": process.env.INTERNAL_TOKEN  // Include internal token in headers
            }
        });
        return result.data;  // Return the response data

    } catch (error) {
        // Log the error if the request fails
        syncRequestLog.error('Error in sync request', error, ':critical:');
        return { type: 'error' };  // Return an error object
    }
};
