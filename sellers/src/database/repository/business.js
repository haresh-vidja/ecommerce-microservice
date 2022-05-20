import { BusinessModel } from '../mongo/models/index.js'; // Mongoose model for business collection

/**
 * Repository class for business-related database operations.
 */
const BusinessRepository = {
  /**
   * Creates a new business document.
   * @param {Object} data - Business details to be saved.
   * @returns {Promise<Object>} - Newly created business record.
   */
  async create(data) {
    const business = new BusinessModel(data);
    return await business.save();
  },

  /**
   * Updates a business record.
   * @param {Object} conditions - MongoDB query conditions.
   * @param {Object} data - Fields to update.
   * @returns {Promise<Object>} - MongoDB update result.
   */
  async update(conditions, data) {
    return await BusinessModel.updateOne(conditions, data);
  },

  /**
   * Finds a single business record.
   * @param {Object} conditions - Query filter.
   * @param {Object} [fields] - Fields to select (optional).
   * @returns {Promise<Object|null>} - Found business or null.
   */
  async find(conditions, fields = null) {
    return await BusinessModel.findOne(conditions, fields);
  },

  /**
   * Finds multiple business records.
   * @param {Object} conditions - Query filter.
   * @param {Object} [fields] - Fields to select (optional).
   * @returns {Promise<Array>} - Array of business documents.
   */
  async findAll(conditions, fields = null) {
    return await BusinessModel.find(conditions, fields);
  },

  /**
   * Counts the number of business records matching conditions.
   * @param {Object} conditions - Query filter.
   * @returns {Promise<number>} - Count of matching documents.
   */
  async count(conditions) {
    return await BusinessModel.countDocuments(conditions);
  }
};

export default BusinessRepository;
