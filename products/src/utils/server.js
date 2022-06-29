import express from 'express';  // Import the Express framework
import morgan from 'morgan';
import { logger } from './logs.js';  // Import logging utility
const appLog = logger.logs('customer-service');  // Initialize a logger for the customer service

export const init = async () => {
    // Create an Express application
    const app = express();
    // Middleware to parse JSON request bodies
    app.use(express.json());
    //Request loger
    app.use(morgan('dev'))
    //Start server on port
    const server = app.listen(process.env.PORT || 80, () => {
        appLog.info(`listening to port ${process.env.PORT || 80}`);  // Log that the server is listening
    }).on('error', (err) => {
        appLog.error(err);  // Log any errors that occur
        process.exit();  // Exit the process if an error occurs
    });

    return { server, app };
}
