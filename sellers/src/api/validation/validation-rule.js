/**
 * Validates whether a value is a valid email address.
 *
 * @param {string} val - The value to validate.
 * @returns {boolean} True if valid email, false otherwise.
 */
export const email = (val) => {
  if (typeof val !== 'string') return false;

  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}(\.[0-9]{1,3}){3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return emailRegex.test(val);
};

/**
 * Validates whether the provided value is a non-empty array.
 *
 * @param {*} val - The value to validate.
 * @returns {boolean} True if it is an array with at least one item, false otherwise.
 */
export const arrayLength = (val) => {
  return Array.isArray(val) && val.length > 0;
};

/**
 * Validates whether a value is a valid MongoDB ObjectId (24-character hex).
 *
 * @param {string} val - The value to validate.
 * @returns {boolean} True if valid ObjectId, false otherwise.
 */
export const objectid = (val) => {
  return typeof val === 'string' && /^[a-fA-F0-9]{24}$/.test(val);
};
