import { AddressModel } from '../mongo/models/index.js'; // Import the Mongoose AddressModel

/**
 * Repository for performing database operations on the Address collection.
 */
const AddressRepository = {
  /**
   * Creates and saves a new address document.
   *
   * @param {Object} data - The address data to be saved.
   * @returns {Promise<Object>} - The created address document.
   */
  create: async (data) => {
    const address = new AddressModel(data);
    return await address.save();
  },

  /**
   * Updates an existing address document based on conditions.
   *
   * @param {Object} conditions - Query to find the document to update.
   * @param {Object} data - The new data to apply to the document.
   * @returns {Promise<Object>} - The result of the update operation.
   */
  update: async (conditions, data) => {
    return await AddressModel.updateOne(conditions, data);
  },

  /**
   * Finds a single address document.
   *
   * @param {Object} conditions - Query to match the document.
   * @param {Object} [fields] - Optional fields to include/exclude.
   * @returns {Promise<Object|null>} - The found address or null.
   */
  find: async (conditions, fields = null) => {
    return await AddressModel.findOne(conditions, fields);
  },

  /**
   * Finds all address documents that match the conditions.
   *
   * @param {Object} conditions - Query to match documents.
   * @param {Object} [fields] - Optional fields to include/exclude.
   * @returns {Promise<Array>} - Array of matching address documents.
   */
  findAll: async (conditions, fields = null) => {
    return await AddressModel.find(conditions, fields);
  },

  /**
   * Counts the number of address documents matching the conditions.
   *
   * @param {Object} conditions - Query to match documents.
   * @returns {Promise<number>} - Count of matching documents.
   */
  count: async (conditions) => {
    return await AddressModel.countDocuments(conditions);
  }
};

export default AddressRepository;
