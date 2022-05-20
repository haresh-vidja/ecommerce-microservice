import jwt from 'jsonwebtoken'; // For generating and verifying JWT tokens
import bcrypt from "bcrypt";    // For securely hashing passwords

import { SellerRepository, BusinessRepository, RoleRepository } from "../database/repository/index.js";  // Database access layer
import Messages from "../config/messages.js";              // Predefined response messages
import { logger } from '../utils/logs.js';                 // Custom logger utility
import { paginationWithSort } from '../utils/wait.js';    // Utility for pagination and sorting
import { sAdd } from '../utils/redis.js';                  // Redis utility for storing tokens

// Initialize a logger for seller-related operations
const sellerServiceLog = logger.logs('seller-service');

const SellerService = {

  /**
   * Handles business registration along with creation of a default seller account.
   * - Validates if email is already used.
   * - Registers new business.
   * - Assigns default role to seller.
   * - Hashes password before saving.
   */
  async SignUp(inputData) {
    try {
      // Check for existing business using the same email
      const existing = await BusinessRepository.count({ email: inputData.email });
      if (existing > 0) {
        return { data: {}, type: "error", message: Messages.BUSINESS_EXISTS };
      }

      // Create the business record
      const newBusiness = await BusinessRepository.create({
        name: inputData.name,
        email: inputData.email
      });

      // Secure the password before storing
      const salt = bcrypt.genSaltSync(10);
      inputData.password = bcrypt.hashSync(inputData.password, salt);
      inputData.business = newBusiness._id;

      // Fetch the default role to assign to this seller
      const defaultRole = await RoleRepository.find({ isDefault: true });
      if (!defaultRole) {
        sellerServiceLog.error('No default role found', inputData.email);
        return { data: {}, type: "error", message: Messages.BUSINESS_ERROR };
      }

      // Assign role and create the seller
      inputData.role = defaultRole._id;
      const newSeller = await SellerRepository.create(inputData);

      return {
        data: { id: newSeller._id },
        type: "success",
        message: Messages.BUSINESS_SUCCESS
      };
    } catch (error) {
      sellerServiceLog.error('Error during sign-up', inputData.email, error);
      return { data: {}, type: "error", message: Messages.BUSINESS_ERROR };
    }
  },

  /**
   * Handles seller login.
   * - Verifies user credentials.
   * - Ensures business and seller account are active.
   * - Generates JWT token.
   * - Caches token in Redis and DB.
   */
  async SignIn(inputData) {
    try {
      // Look up seller by email
      const seller = await SellerRepository.find(
        { email: inputData.username },
        { password: 1, status: 1, name: 1, role: 1, business: 1 }
      );

      // If seller exists and password matches
      if (seller && await bcrypt.compare(inputData.password, seller.password)) {
        // Check if seller account is active
        if (seller.status !== 'active') {
          return { data: {}, type: "error", message: Messages.LOGIN_STATUS_ERROR };
        }

        // Check if business is verified
        const business = await BusinessRepository.find(
          { _id: seller.business },
          { status: 1, name: 1 }
        );
        if (business.status === 'pending') {
          return { data: {}, type: "error", message: Messages.BUSINESS_LOGIN_ERROR };
        }

        // Generate authentication token
        const token = generateJWTToken({
          id: seller._id,
          name: seller.name,
          profileId: seller.role,
          business: seller.business
        });

        // Save token in DB and Redis for session tracking
        await Promise.all([
          SellerRepository.update({ _id: seller._id }, { $push: { token } }),
          sAdd(`sellerToken:${seller._id}`, token)
        ]);

        return { data: { id: seller._id, token }, type: "success", message: Messages.LOGIN_SUCCESS };
      }

      // Log and return error if login fails
      sellerServiceLog.info('Invalid login attempt', inputData.username);
      return { data: {}, type: "error", message: Messages.LOGIN_PASSWORD_ERROR };

    } catch (error) {
      sellerServiceLog.error('Error during sign-in', inputData.username, error);
      return { data: {}, type: "error", message: Messages.LOGIN_PASSWORD_ERROR };
    }
  },

  /**
   * Creates a new seller under an existing business.
   * - Verifies email uniqueness.
   * - Encrypts password.
   * - Associates seller with creator and business.
   */
  async Create(inputData, { id, business }) {
    try {
      // Check for duplicate email
      const existing = await SellerRepository.count({ email: inputData.email });
      if (existing > 0) {
        return { data: {}, type: "error", message: Messages.EMAIL_UNIQUE_ERROR };
      }

      // Hash password and attach metadata
      const salt = bcrypt.genSaltSync(10);
      inputData.password = bcrypt.hashSync(inputData.password, salt);
      inputData.createdBy = id;
      inputData.business = business;

      // Create seller
      const seller = await SellerRepository.create(inputData);

      return { data: { id: seller._id }, type: "success", message: Messages.SELLER_CREATE_SUCCESS };
    } catch (error) {
      sellerServiceLog.error('Error while creating seller', business, inputData.email, error);
      return { data: {}, type: "error", message: Messages.SELLER_CREATE_ERROR };
    }
  },

  /**
   * Retrieves a paginated list of sellers for a business.
   * - Supports search filtering by name.
   * - Excludes sensitive fields (e.g., token, business).
   */
  async GetSellerList(query, { business }) {
    try {
      const conditions = { business };

      // Apply search filtering
      if (query?.search) {
        conditions.name = { $regex: query.search, $options: "i" };
      }

      const paginationData = paginationWithSort(query);

      // Get sellers and total count
      const [seller, count] = await Promise.all([
        SellerRepository.findAllWithRole(conditions, { token: 0, business: 0 }, paginationData),
        SellerRepository.count(conditions)
      ]);

      return {
        data: { seller, count },
        type: "success",
        message: Messages.SELLER_LIST_SUCCESS
      };
    } catch (error) {
      sellerServiceLog.error('Error fetching seller list', query, error);
      return { data: {}, type: "error", message: Messages.SELLER_LIST_ERROR };
    }
  }
};

export default SellerService;

/**
 * Utility to generate a signed JWT token.
 * @param {Object} data - Payload to encode.
 * @param {String} [expire='7d'] - Expiration duration.
 * @returns {String} - Encoded JWT token.
 */
function generateJWTToken(data, expire = '7d') {
  return jwt.sign(data, process.env.APP_SECRET, { expiresIn: expire });
}
