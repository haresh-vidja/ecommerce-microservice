// Load environment-specific configuration (e.g., .env.dev, .env.prod)
import './config/env.js';

// Initialize database connections
import { dbConnect} from './database/dbConnect.js';

// Initialize optional integrations
import { init as syncEventInit } from './utils/sync-request.js';  // For internal API sync calls
import { init as kafkaInit } from './utils/kafka.js';            // Kafka event-based communication
import { init as rabbitMqInit } from './utils/message-broker.js';// RabbitMQ message broker

// Start the Express HTTP server
import { init as expressServer } from './utils/server.js';

// Setup graceful shutdown (handles SIGINT, SIGTERM, errors)
import { init as shutdownInit } from './utils/graceful-shutdown.js';

// Initialize HTTP API routes
import { init as apiInit } from './api/init.js';


(async () => {
  try {
    // ------------------------- APPLICATION BOOTSTRAP -------------------------

    // Start Express server
    const { app, server } = await expressServer();

    // database connect
    await dbConnect();

    // Connect to MySQL (optional, uncomment if needed)
    // await mySqlInit();

    // Initialize RabbitMQ or Kafka for event/message-based systems (optional)
    // await rabbitMqInit();
    // await kafkaInit();

    // Setup internal HTTP sync service routes
    syncEventInit(app);

    // Register all public API endpoints
    apiInit(app);

    // Hook graceful shutdown logic to server events and process signals
    shutdownInit(server);

  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1); // Exit on boot failure
  }
})();
