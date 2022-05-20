import gracefulShutdown from 'http-graceful-shutdown';
import { logger } from './logs.js';
import { wait } from './wait.js';

const shutdownLogs = logger.logs('shutdown');

// Global shutdown handler registry
globalThis.globalHandler = globalThis.globalHandler || [];

/**
 * Final function called after all shutdown tasks complete.
 */
function finalFunction() {
  shutdownLogs.info('Server gracefully shut down.');
}

/**
 * Executes all registered shutdown handlers.
 *
 * @param {string} signal - The signal or event that triggered shutdown.
 * @returns {Promise<void>}
 */
async function shutdownFunction(signal) {
  shutdownLogs.info(`Shutdown initiated due to signal: ${signal}`);

  for (const handler of globalHandler) {
    try {
      await handler();
    } catch (error) {
      shutdownLogs.error('Error in shutdown handler:', error);
    }
  }

  await wait(2000); // Small delay to ensure logs flush
}

/**
 * Initializes graceful shutdown behavior for an app or server.
 *
 * @param {http.Server|null} server - Optional HTTP server instance to bind shutdown to.
 */
export const init = async (server = null) => {
  const shutdownHandler = async (signal) => {
    await Promise.race([
      shutdownFunction(signal),
      wait(20000) // Fallback in case handlers hang
    ]);
    finalFunction();
    await wait(2000);
    process.exit();
  };

  if (server) {
    // Graceful shutdown with HTTP server
    gracefulShutdown(server, {
      signals: 'SIGINT SIGTERM',
      timeout: 20000,
      development: false,
      forceExit: true,
      onShutdown: shutdownFunction,
      finally: finalFunction
    });
  } else {
    // Manual fallback for non-server apps
    process.on('SIGINT', () => shutdownHandler('SIGINT'));
    process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
  }

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    shutdownLogs.error('Unhandled Rejection at:', promise, 'Reason:', reason);
    await shutdownHandler('unhandledRejection');
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', async (err) => {
    shutdownLogs.error('Uncaught Exception:', err);
    await shutdownHandler('uncaughtException');
  });
};

/**
 * Registers a shutdown handler to be executed during application shutdown.
 *
 * @param {() => Promise<void>} handler - Async function to be called before exit.
 */
export const addShutdownHandler = (handler) => {
  globalHandler.push(handler);
};
