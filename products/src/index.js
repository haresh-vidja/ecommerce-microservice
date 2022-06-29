
import './config/env.js';  // Load environment variables
import { mongoInit, mySqlInit } from './database/index.js';  // Initialize the database
import { init as syncEventInit } from './utils/sync-request.js';  // Import sync event API routes
import { init as kafkaInit } from './utils/kafka.js';
import { init as rabbitMqInit } from './utils/message-broker.js';
import {init as expressServer} from './utils/server.js';
import {init as shutdownInit} from './utils/graceful-shutdown.js';
// Import customer API routes
import { init as apiInit } from './api/index.js';

//initialize http server
const {app, server} = await expressServer();

//initialize mongodb service
await mongoInit();

//initialize mysql service
// await mySqlInit()

//initialize message broker
await rabbitMqInit();

//initialize message broker
// await kafkaInit();

//initialize sync service
syncEventInit(app);

//initialize customer API
apiInit(app);

//initialize graceful shutdown
shutdownInit(server);