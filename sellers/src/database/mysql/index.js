import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { addShutdownHandler } from '../../utils/graceful-shutdown.js';

const __dirname = path.resolve();

/**
 * Initializes MySQL database connection using Sequelize ORM.
 * Loads models dynamically, sets up associations, and syncs schema.
 */
export const init = async () => {
  try {
    // Setup Sequelize instance
    const sequelize = new Sequelize(
      process.env.MYSQL_DATABASE,
      process.env.MYSQL_USERNAME,
      process.env.MYSQL_PASSWORD,
      {
        host: process.env.MYSQL_HOST,
        dialect: process.env.MYSQL_DIALECT || 'mysql',
        logging: process.env.MYSQL_LOGGING === 'true' ? console.log : false
      }
    );

    // Test connection
    try {
      await sequelize.authenticate();
      console.info('Connected to MySQL');
    } catch (err) {
      console.error('Unable to connect to MySQL:', err);
      process.kill(process.pid, 'SIGINT');
    }

    // Load all models dynamically
    const modelsPath = path.join(__dirname, '/src/database/mysql/models');
    const modelFiles = fs.readdirSync(modelsPath).filter(
      file => file.endsWith('.js') && file !== 'index.js'
    );

    const loadedModels = [];

    // Initialize models
    for (const file of modelFiles) {
      const modelModule = await import(`${modelsPath}/${file}`);
      const model = modelModule.default.init(sequelize);
      loadedModels.push(modelModule.default);
    }

    // Setup associations
    for (const model of loadedModels) {
      if (typeof model.associate === 'function') {
        model.associate(sequelize.models);
      }
    }

    // Synchronize models with the database
    await sequelize.sync({ force: false });
    console.info('MySQL schema synchronized');

    // Graceful shutdown hook
    addShutdownHandler(async () => {
      try {
        await sequelize.close();
        console.info('MySQL disconnected cleanly');
      } catch (error) {
        console.error('Error during MySQL disconnect:', error);
      }
    });

  } catch (error) {
    console.error('MySQL initialization error:', error);
  }

  return false;
};
