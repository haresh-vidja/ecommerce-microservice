import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { CustomerRepository } from '../database/repository/index.js';
import Messages from '../config/messages.js';
import { logger } from '../utils/logs.js';
import { sAdd } from '../utils/redis.js';

const customerServiceLog = logger.logs('customer-service'); // Logger instance

/**
 * Service to handle customer authentication and profile operations.
 */
const CustomerService = {
  /**
   * Registers a new customer.
   *
   * @param {Object} inputData - Signup form data.
   * @returns {Promise<Object>} Response object.
   */
  SignUp: async (inputData) => {
    try {
      const existingCustomer = await CustomerRepository.GetCount({ email: inputData.email });

      if (existingCustomer > 0) {
        return {
          data: {},
          type: 'error',
          message: Messages.EMAIL_UNIQUE_ERROR
        };
      }

      // Hash password
      inputData.salt = bcrypt.genSaltSync(10);
      inputData.password = bcrypt.hashSync(inputData.password, inputData.salt);

      const newCustomer = await CustomerRepository.CreateCustomer(inputData);

      const token = generateJWTToken({
        id: newCustomer._id,
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName
      });

      await Promise.all([
        CustomerRepository.UpdateCustomer({ _id: newCustomer._id }, { $push: { token } }),
        sAdd(`token:${newCustomer._id}`, token)
      ]);

      return {
        data: { id: newCustomer._id, token },
        type: 'success',
        message: Messages.SIGNUP_SUCCESS
      };
    } catch (error) {
      customerServiceLog.error('Error creating customer', { email: inputData.email, error });
      return {
        data: {},
        type: 'error',
        message: Messages.SIGNUP_ERROR
      };
    }
  },

  /**
   * Logs in a customer.
   *
   * @param {Object} inputData - Login credentials.
   * @returns {Promise<Object>} Response object.
   */
  SignIn: async (inputData) => {
    try {
      const customer = await CustomerRepository.FindCustomerByCondition(
        { email: inputData.username },
        { salt: 1, password: 1, status: 1, firstName: 1, lastName: 1 }
      );

      if (customer) {
        const match = await bcrypt.compare(inputData.password, customer.password);

        if (match) {
          if (customer.status !== 'active') {
            customerServiceLog.info('Inactive customer status', { email: inputData.username });
            return {
              data: {},
              type: 'error',
              message: Messages.LOGIN_STATUS_ERROR
            };
          }

          const token = generateJWTToken({
            id: customer._id,
            firstName: customer.firstName,
            lastName: customer.lastName
          });

          await Promise.all([
            CustomerRepository.UpdateCustomer({ _id: customer._id }, { $push: { token } }),
            sAdd(`token:${customer._id}`, token)
          ]);

          return {
            data: { id: customer._id, token },
            type: 'success',
            message: Messages.LOGIN_SUCCESS
          };
        }

        customerServiceLog.info('Password mismatch', { email: inputData.username });
      } else {
        customerServiceLog.info('Customer not found', { email: inputData.username });
      }

      return {
        data: {},
        type: 'error',
        message: Messages.LOGIN_PASSWORD_ERROR
      };
    } catch (error) {
      customerServiceLog.error('Error during login', { email: inputData.username, error });
      return {
        data: {},
        type: 'error',
        message: Messages.LOGIN_PASSWORD_ERROR
      };
    }
  },

  /**
   * Fetches customer profile by ID.
   *
   * @param {string|ObjectId} id - Customer ID.
   * @returns {Promise<Object>} Response object.
   */
  GetProfile: async (id) => {
    try {
      const customer = await CustomerRepository.FindCustomerByCondition(
        { _id: id },
        {
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          verifiedEmail: 1,
          verifiedMobile: 1
        }
      );

      return {
        data: customer,
        type: 'success',
        message: Messages.PROFILE_SUCCESS
      };
    } catch (error) {
      customerServiceLog.error('Error fetching profile', { id, error });
      return {
        data: {},
        type: 'error',
        message: Messages.PROFILE_ERROR
      };
    }
  }
};

export default CustomerService;

/**
 * Generates a JWT token.
 *
 * @param {Object} data - Payload to encode in token.
 * @param {string} [expire='7d'] - Token expiration (default: 7 days).
 * @returns {string} Signed JWT token.
 */
function generateJWTToken(data, expire = '7d') {
  return jwt.sign(data, process.env.APP_SECRET, { expiresIn: expire });
}
