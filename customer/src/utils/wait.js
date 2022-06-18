/**
 * Waits for a specified amount of time.
 *
 * @param {number} time - Time in milliseconds to wait.
 * @returns {Promise<void>} Resolves after the given delay.
 */
export const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));
