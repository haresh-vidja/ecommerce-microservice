/**
 * Validates whether a given string is a valid email address.
 *
 * @param {string} val - The email string to validate.
 * @returns {boolean} True if the input is a valid email, false otherwise.
 */
export const email = (val) => {
    if (typeof val !== 'string') return false;

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}(\.[0-9]{1,3}){3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return emailRegex.test(val);
};

/**
 * Checks if a value is a non-empty array.
 *
 * @param {*} val - The value to check.
 * @returns {boolean} True if the value is an array with at least one item, false otherwise.
 */
export const arrayLength = (val) => {
    return Array.isArray(val) && val.length > 0;
};

/**
 * Validates whether a string is a valid MongoDB ObjectId (24 hex characters).
 *
 * @param {string} val - The string to validate.
 * @returns {boolean} True if the input is a valid ObjectId, false otherwise.
 */
export const objectid = (val) => {
    return typeof val === 'string' && /^[a-fA-F0-9]{24}$/.test(val);
};
