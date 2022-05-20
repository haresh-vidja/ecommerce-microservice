import { AccessModel } from '../mongo/models/index.js'; // MongoDB access model

/**
 * Repository for role/access-related database operations.
 */
const RoleRepository = {
  /**
   * Fetches all access entries grouped by module.
   *
   * @param {Object} conditions - MongoDB query filter.
   * @returns {Promise<Array>} List of grouped access entries.
   */
  async findAll(conditions = {}) {
    try {
      return await AccessModel.aggregate([
        { $match: conditions },
        {
          $group: {
            _id: "$module", // Group by module
            data: {
              $push: {
                description: "$description",
                slug: "$slug"
              }
            }
          }
        },
        { $sort: { _id: 1 } } // Sort by module name (ascending)
      ]);
    } catch (error) {
      console.error("Error in RoleRepository.findAll:", error);
      throw error;
    }
  }
};

export default RoleRepository;
