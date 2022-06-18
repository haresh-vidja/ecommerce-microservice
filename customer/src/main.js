// Load environment variables from .env file
import './config/env.js';

// Initialize database connections
import { dbConnect} from './database/dbConnect.js';                             // MongoDB and MySQL
import { init as syncEventInit } from './utils/sync-request.js';               // Internal sync event API
import { init as kafkaInit } from './utils/kafka.js';                          // Kafka setup
import { init as rabbitMqInit } from './utils/message-broker.js';             // RabbitMQ setup
import { init as expressServer } from './utils/server.js';                     // Express server
import { init as shutdownInit } from './utils/graceful-shutdown.js';          // Graceful shutdown
import { init as apiInit } from './api/index.js';                              // Customer API routes

// ------------------ APPLICATION STARTUP ------------------

/**
 * Bootstraps the application:
 * - Starts HTTP server
 * - Initializes databases
 * - Initializes message brokers
 * - Registers APIs and internal sync events
 * - Enables graceful shutdown
 */
const bootstrap = async () => {
    // Start HTTP server
    const { app, server } = await expressServer();

    // Connect to Database
    await dbConnect();

    // Initialize RabbitMQ (remove comment to enable)
    // await rabbitMqInit();

    // Initialize Kafka (remove comment to enable)
    // await kafkaInit();

    // Register internal sync event handler route
    syncEventInit(app);

    // Register customer-facing API routes
    apiInit(app);

    // Setup graceful shutdown handlers
    shutdownInit(server);
};

// Launch the app
bootstrap().catch((err) => {
    console.error('Application failed to start:', err);
    process.exit(1);
});
