import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { addShutdownHandler } from '../../utils/graceful-shutdown.js';
const __dirname = path.resolve();
export const init = async () => {

    try {

        const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USERNAME, process.env.MYSQL_PASSWORD, {
            host: process.env.MYSQL_HOST,
            dialect: process.env.MYSQL_DIALECT,
            logging: console.log
        });

        try {
            await sequelize.authenticate();
            console.info('Connected to MySQL');
        } catch (error) {
            console.error('Unable to connect to MySql');
            process.kill(process.pid, "SIGINT");
        }

        const modelFiles = fs.readdirSync(__dirname + "/src/database/mysql/models").filter((file) => file.endsWith(".js") && file != 'index.js');

        for (const file of modelFiles) {
            const model = await import(`${__dirname}/src/database/mysql/models/${file}`);
            model.default.init(sequelize);
        }

        modelFiles.map(async (file) => {
            const model = await import(`${__dirname}/src/database/mysql/models/${file}`);
            model.default.associate && model.default.associate(sequelize.models);
        });


        sequelize.sync({ force: false }).then(() => {
            console.log('Database synchronized');
        }).catch((error) => {
            console.error('Unable to synchronize database:', error);
        });

        addShutdownHandler(async () => {
            try {
                sequelize.close()
                console.info('MySql disconnected');
            } catch (error) {
                console.log("Error in MySQL disconnect");
            }
        });

    } catch (error) {
        console.error('MySQL connection error', error);
    }
    return false;
}