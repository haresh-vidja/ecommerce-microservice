import { SellerModel } from '../mongo/models/index.js'; // Mongoose model for sellers

/**
 * Repository for seller-related database operations.
 */
const SellerRepository = {
  /**
   * Creates a new seller.
   * @param {Object} data - Seller data to be saved.
   * @returns {Promise<Object>} - Newly created seller document.
   */
  async create(data) {
    const seller = new SellerModel(data);
    return await seller.save();
  },

  /**
   * Finds a single seller by condition.
   * @param {Object} condition - MongoDB filter object.
   * @param {Object} [fields={}] - Optional projection fields.
   * @returns {Promise<Object|null>} - Seller document or null.
   */
  async find(condition, fields = {}) {
    return await SellerModel.findOne(condition, fields);
  },

  /**
   * Updates a seller matching the given condition.
   * @param {Object} condition - Filter for document to update.
   * @param {Object} data - Fields to update.
   * @returns {Promise<Object>} - MongoDB update result.
   */
  async update(condition, data) {
    return await SellerModel.updateOne(condition, data);
  },

  /**
   * Finds all sellers matching the filter.
   * @param {Object} [filter={}] - Query conditions.
   * @param {Object} [fields={}] - Fields to project.
   * @returns {Promise<Array>} - List of matching sellers.
   */
  async findAll(filter = {}, fields = {}) {
    return await SellerModel.find(filter, fields);
  },

  /**
   * Finds sellers with their roles populated.
   * Supports pagination and sorting.
   *
   * @param {Object} filter - Query conditions.
   * @param {Object} fields - Fields to return.
   * @param {Object} options - Pagination/sorting options.
   * @param {Object} options.sort - Sort object (e.g., { name: 1 }).
   * @param {number} options.skip - Number of docs to skip.
   * @param {number} options.limit - Number of docs to return.
   * @returns {Promise<Array>} - Sellers with populated role name.
   */
  async findAllWithRole(filter = {}, fields = {}, { sort = {}, skip = 0, limit = 0 } = {}) {
    return await SellerModel
      .find(filter, fields)
      .populate('role', 'name -_id')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  },

  /**
   * Counts sellers matching a condition.
   * @param {Object} [condition={}] - Filter object.
   * @returns {Promise<number>} - Count of matching sellers.
   */
  async count(condition = {}) {
    return await SellerModel.countDocuments(condition);
  }
};

export default SellerRepository;
