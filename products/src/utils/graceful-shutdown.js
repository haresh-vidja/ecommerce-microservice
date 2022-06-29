import gracefulShutdown from 'http-graceful-shutdown';
import { logger } from './logs.js';  // Import logging utility
const shutdownLogs = logger.logs('shutdown');  // Initialize a logger for broker operations
import { wait } from './index.js';

//global variable to store shutdown handler
global.globalHandler = [];

//final function
function finalFunction() {
    shutdownLogs.info('Server gracefulls shutted down.....')
}

//function to process shutdown handler
function shutdownFunction(signal) {
    return new Promise(async (resolve) => {
        for (const handler of globalHandler) {
            try {
                await handler();
            } catch (error) {
                shutdownLogs.error('Error in shutdown process', error);
            }
        }
        await wait(2000);
        resolve();
    });
}

//function to start graceful shoutdown
export const init = async (server = null) => {
    if (server) {
        //if server exists use gracefulShutdown package
        gracefulShutdown(server, {
            signals: 'SIGINT SIGTERM',
            timeout: 20000,                   // timeout: 10 secs
            development: false,               // not in dev mode
            forceExit: true,
            onShutdown: shutdownFunction,    // triggers process.exit() at the end of shutdown process
            finally: finalFunction         // finally function (sync) - e.g. for logging
        });
    } else {
        //if server don't exists use define manually process
        process.on('SIGTERM', async () => {
            await Promise.race([wait(20000), shutdownFunction('SIGTERM')])
            finalFunction();
            await wait(2000);
            process.exit()
        });
        process.on('SIGINT', async () => {
            await Promise.race([wait(20000), shutdownFunction('SIGTERM')])
            finalFunction();
            await wait(2000);
            process.exit()
        });
    }
    // Handle unhandled rejection
    process.on('unhandledRejection', async (reason, promise) => {
        shutdownLogs.error('Unhandled Rejection at:', promise, 'reason:', reason);
        await Promise.race([wait(20000), shutdownFunction('unhandledRejection')])
        finalFunction();
        await wait(2000);
        process.exit()
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (err) => {
        shutdownLogs.error('Uncaught Exception:', err);
        await Promise.race([wait(20000), shutdownFunction('uncaughtException')])
        finalFunction();
        await wait(2000);
        process.exit()
    });

}

/**
 * Use to register shutdown handler
 * @param {Callback Function} handler 
 */
export const addShutdownHandler = (handler) => {
    globalHandler.push(handler);
}