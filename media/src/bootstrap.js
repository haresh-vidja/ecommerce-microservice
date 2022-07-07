// Load environment variables from .env
import './config/env.js';

// Initialize databases
import { mongoInit, mySqlInit } from './database/index.js';

// Initialize utilities and services
import { init as syncEventInit } from './utils/sync-request.js';
import { init as kafkaInit } from './utils/kafka.js';
import { init as rabbitMqInit } from './utils/message-broker.js';
import { init as expressServer } from './utils/server.js';
import { init as shutdownInit } from './utils/graceful-shutdown.js';

// Load API routes
import { init as apiInit } from './api/index.js';

(async () => {
  try {
    // 1️⃣ Start Express HTTP server
    const { app, server } = await expressServer();

    // 2️⃣ Initialize MongoDB
    await mongoInit();

    // 3️⃣ (Optional) Initialize MySQL
    // await mySqlInit();

    // 4️⃣ (Optional) Initialize RabbitMQ broker
    // await rabbitMqInit();

    // 5️⃣ Initialize Kafka broker
    await kafkaInit();

    // 6️⃣ Attach internal sync-request API
    syncEventInit(app);

    // 7️⃣ Register application API routes
    apiInit(app);

    // 8️⃣ Initialize graceful shutdown hooks
    shutdownInit(server);

  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1); // Exit on boot failure
  }
})();
