import { RolesModel } from '../mongo/models/index.js'; // Mongoose model for roles

/**
 * Repository for role-related MongoDB operations.
 */
const RoleRepository = {
  /**
   * Creates a new role.
   * @param {Object} data - Role data to save.
   * @returns {Promise<Object>} - Created role document.
   */
  async create(data) {
    const role = new RolesModel(data);
    return await role.save();
  },

  /**
   * Updates a role matching the given conditions.
   * @param {Object} conditions - Filter conditions (e.g. { _id }).
   * @param {Object} data - Fields to update.
   * @returns {Promise<Object>} - MongoDB update result.
   */
  async update(conditions, data) {
    return await RolesModel.updateOne(conditions, data);
  },

  /**
   * Finds a single role.
   * @param {Object} conditions - MongoDB filter.
   * @param {Object} [fields] - Optional fields to project.
   * @returns {Promise<Object|null>} - Role document or null.
   */
  async find(conditions, fields = null) {
    return await RolesModel.findOne(conditions, fields);
  },

  /**
   * Finds multiple roles with optional pagination and sorting.
   * @param {Object} conditions - Query filter.
   * @param {Object} [fields] - Projection fields (optional).
   * @param {Object} [options] - Pagination/sorting: { limit, skip, sort }.
   * @returns {Promise<Array>} - List of matching roles.
   */
  async findAll(conditions = {}, fields = null, { limit = 0, skip = 0, sort = { _id: -1 } } = {}) {
    return await RolesModel.find(conditions, fields).sort(sort).skip(skip).limit(limit);
  },

  /**
   * Counts the number of roles matching the conditions.
   * @param {Object} conditions - Query filter.
   * @returns {Promise<number>} - Count of matching documents.
   */
  async count(conditions = {}) {
    return await RolesModel.countDocuments(conditions);
  }
};

export default RoleRepository;
