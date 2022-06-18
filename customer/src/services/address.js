import { AddressRepository } from "../database/repository/index.js";   // Address repository
import Messages from "../config/messages.js";                          // Static response messages
import { logger } from "../utils/logs.js";                             // Custom logger utility

const addressServiceLog = logger.logs("address-service");             // Logger instance for this service

/**
 * Service layer to handle business logic for address management.
 */
const AddressService = {
  /**
   * Creates a new address for a customer. Handles default address logic.
   *
   * @param {Object} inputData - Address details from request body.
   * @param {string|ObjectId} customer - The customer ID associated with the address.
   * @returns {Promise<Object>} - Response object with status, data, and message.
   */
  Create: async (inputData, customer) => {
    try {
      inputData.customer = customer;

      // If the new address is marked as default, unset existing defaults
      if (inputData.isDefault) {
        await AddressRepository.update(
          { customer, isDefault: true },
          { $set: { isDefault: false } }
        );
      }

      // Save new address
      const address = await AddressRepository.create(inputData);

      return {
        data: { id: address._id },
        type: "success",
        message: Messages.ADDRESS_ADD_SUCCESS
      };
    } catch (error) {
      addressServiceLog.error("Error creating address", { customer, error });
      return {
        data: {},
        type: "error",
        message: Messages.ADDRESS_ADD_ERROR
      };
    }
  },

  /**
   * Retrieves a specific address by ID for the given customer.
   *
   * @param {string|ObjectId} id - Address ID.
   * @param {string|ObjectId} customer - Customer ID.
   * @returns {Promise<Object>} - Response with address data or error.
   */
  Get: async (id, customer) => {
    try {
      const address = await AddressRepository.find(
        { _id: id, customer },
        { createdAt: 0, updatedAt: 0 }
      );

      return {
        data: address,
        type: "success",
        message: Messages.ADDRESS_GET_SUCCESS
      };
    } catch (error) {
      addressServiceLog.error("Error fetching address", { id, error });
      return {
        data: {},
        type: "error",
        message: Messages.ADDRESS_GET_ERROR
      };
    }
  },

  /**
   * Retrieves all addresses associated with the given customer.
   *
   * @param {string|ObjectId} customer - Customer ID.
   * @returns {Promise<Object>} - Response with address list or error.
   */
  GetAll: async (customer) => {
    try {
      const addresses = await AddressRepository.findAll(
        { customer },
        { createdAt: 0, updatedAt: 0 }
      );

      return {
        data: addresses,
        type: "success",
        message: Messages.ADDRESS_GET_SUCCESS
      };
    } catch (error) {
      addressServiceLog.error("Error fetching all addresses", { customer, error });
      return {
        data: {},
        type: "error",
        message: Messages.ADDRESS_GET_ERROR
      };
    }
  }
};

export default AddressService;
