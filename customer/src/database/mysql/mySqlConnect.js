import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { addShutdownHandler } from '../../utils/graceful-shutdown.js';

// Resolve __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sequelize instance holder (optional for export)
let sequelize;

/**
 * Initializes Sequelize ORM, loads models dynamically, applies associations,
 * and sets up graceful shutdown.
 *
 * @returns {Promise<boolean>}
 */
export const init = async () => {
    try {

        const mysqlUri = process.env.DATABASE_URI;  // e.g. mysql://root:wcgtest@192.168.1.61:3306/seller
        
        // Create Sequelize instance
        sequelize = new Sequelize(mysqlUri, {
            logging: console.log, // Set to false in production
            dialect: 'mysql'      // Optional if URI contains mysql://
        });
        
        // Test connection
        await sequelize.authenticate();
        console.info('Connected to MySQL');

        // Dynamically load all model files (except index.js)
        const modelsDir = path.join(__dirname, '../../database/mysql/models');
        const modelFiles = fs.readdirSync(modelsDir)
            .filter((file) => file.endsWith('.js') && file !== 'index.js');

        // Load and initialize models
        for (const file of modelFiles) {
            const modelModule = await import(path.join(modelsDir, file));
            modelModule.default.init(sequelize); // Call init(sequelize)
        }

        // Setup model associations (if any)
        for (const file of modelFiles) {
            const modelModule = await import(path.join(modelsDir, file));
            if (typeof modelModule.default.associate === 'function') {
                modelModule.default.associate(sequelize.models);
            }
        }

        // Sync models with database
        await sequelize.sync({ force: false });
        console.log('Database schema synchronized');

        // Graceful shutdown on SIGINT/SIGTERM
        addShutdownHandler(async () => {
            try {
                await sequelize.close();
                console.info('MySQL disconnected gracefully');
            } catch (error) {
                console.error('Error while disconnecting MySQL:', error);
            }
        });

        return true;
    } catch (error) {
        console.error('MySQL initialization error:', error);
        process.kill(process.pid, 'SIGINT');
        return false;
    }
};

