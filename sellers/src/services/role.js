import { RoleRepository, AccessRepository } from "../database/repository/index.js";
import Messages from "../config/messages.js";
import { logger } from '../utils/logs.js';
import { sAdd, del } from '../utils/redis.js';
import { paginationWithSort } from '../utils/wait.js';

const roleServiceLog = logger.logs('role-service');

const RoleService = {

  /**
   * Creates a new role.
   * @param {Object} inputData - Role data including name and access.
   * @param {Object} user - Request context containing `id` and `business`.
   * @returns {Object} - Response object with status and message.
   */
  async Create(inputData, { id, business }) {
    try {
      const roleCount = await RoleRepository.count({
        $or: [{ business }, { isDefault: true }],
        name: inputData.name
      });

      if (roleCount > 0) {
        roleServiceLog.error('Duplicate role name', business, inputData.name);
        return { data: {}, type: "error", message: Messages.ROLE_DUPLICATE_ERROR };
      }

      inputData.createdBy = id;
      inputData.business = business;

      const role = await RoleRepository.create(inputData);
      await sAdd(`sellerRole:${role._id}`, inputData.access);

      return { data: { id: role._id }, type: "success", message: Messages.ROLE_SUCCESS };
    } catch (error) {
      roleServiceLog.error('Error while creating role', id, error);
      return { data: {}, type: "error", message: Messages.ROLE_ERROR };
    }
  },

  /**
   * Updates an existing role.
   * @param {Object} inputData - Role update data with roleId, name, and access.
   * @param {Object} user - Request context containing `business`.
   * @returns {Object} - Response with update status.
   */
  async Update(inputData, { business }) {
    try {
      const roleCount = await RoleRepository.count({
        $or: [{ business }, { isDefault: true }],
        _id: { $ne: inputData.roleId },
        name: inputData.name
      });

      if (roleCount > 0) {
        roleServiceLog.error('Duplicate role name on update', business, inputData.name);
        return { data: {}, type: "error", message: Messages.ROLE_DUPLICATE_ERROR };
      }

      await RoleRepository.update({ _id: inputData.roleId, isDefault: false }, inputData);
      await del(`sellerRole:${inputData.roleId}`);
      await sAdd(`sellerRole:${inputData.roleId}`, inputData.access);

      return { data: {}, type: "success", message: Messages.ROLE_UPDATE_SUCCESS };
    } catch (error) {
      roleServiceLog.error('Error while updating role', inputData.roleId, error);
      return { data: {}, type: "error", message: Messages.ROLE_UPDATE_ERROR };
    }
  },

  /**
   * Fetches grouped access list.
   * @param {Array} [type] - Optional array of access types to filter by.
   * @returns {Object} - Access group list by module.
   */
  async GetAccessList(type) {
    try {
      const conditions = type ? { type: [...type, 'other'] } : {};
      const access = await AccessRepository.findAll(conditions);

      return { data: access, type: "success", message: Messages.ACCESS_SUCCESS };
    } catch (error) {
      roleServiceLog.error('Error while fetching access list', error);
      return { data: {}, type: "error", message: Messages.ACCESS_ERROR };
    }
  },

  /**
   * Retrieves paginated and filtered role list.
   * @param {Object} query - Query params (search, page, limit, sort).
   * @param {Object} user - Request context containing `business`.
   * @returns {Object} - Role list and count.
   */
  async GetRoleList(query, { business }) {
    try {
      const conditions = {
        $or: [{ business }, { isDefault: true }]
      };

      if (query?.search) {
        conditions.name = { $regex: query.search, $options: "i" };
      }

      const paginationData = paginationWithSort(query);

      const [access, count] = await Promise.all([
        RoleRepository.findAll(conditions, {}, paginationData),
        RoleRepository.count(conditions)
      ]);

      return {
        data: { access, count },
        type: "success",
        message: Messages.ROLE_LIST_SUCCESS
      };
    } catch (error) {
      roleServiceLog.error('Error while fetching role list', query, error);
      return { data: {}, type: "error", message: Messages.ROLE_LIST_ERROR };
    }
  }
};

export default RoleService;
