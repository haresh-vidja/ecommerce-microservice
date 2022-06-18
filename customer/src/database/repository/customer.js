import { CustomerModel } from '../mongo/models/index.js';   // MongoDB model
import { User } from '../mysql/models/index.js';            // Sequelize model (if needed for joins or audits)

/**
 * Repository for performing MongoDB operations related to customers.
 */
const CustomerRepository = {
  /**
   * Creates a new customer in MongoDB.
   *
   * @param {Object} data - Customer data to save.
   * @returns {Promise<Object>} - The created customer document.
   */
  createCustomer: async (data) => {
    const customer = new CustomerModel(data);
    return await customer.save();
  },

  /**
   * Finds a single customer by given conditions.
   *
   * @param {Object} condition - Mongoose query filter.
   * @param {Object} [fields={}] - Fields to include/exclude.
   * @returns {Promise<Object|null>} - Matching customer or null.
   */
  findCustomerByCondition: async (condition, fields = {}) => {
    return await CustomerModel.findOne(condition, fields);
  },

  /**
   * Updates a customer based on conditions.
   *
   * @param {Object} condition - Mongoose update condition.
   * @param {Object} data - Fields to update.
   * @returns {Promise<Object>} - MongoDB update result.
   */
  updateCustomer: async (condition, data) => {
    return await CustomerModel.updateOne(condition, data);
  },

  /**
   * Retrieves all customers that match a filter.
   *
   * @param {Object} [filter={}] - MongoDB filter.
   * @param {Object} [fields={}] - Fields to include/exclude.
   * @returns {Promise<Array>} - Array of matching customers.
   */
  getAllCustomers: async (filter = {}, fields = {}) => {
    return await CustomerModel.find(filter, fields);
  },

  /**
   * Counts the number of customers matching a condition.
   *
   * @param {Object} [condition={}] - MongoDB filter.
   * @returns {Promise<number>} - Number of matched customers.
   */
  getCustomerCount: async (condition = {}) => {
    return await CustomerModel.countDocuments(condition);
  }
};

export default CustomerRepository;
