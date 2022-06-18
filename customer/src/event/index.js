import CustomerService from '../services/customer.js'; // Import CustomerService class or module

/**
 * Maps service command keys to corresponding CustomerService methods.
 * Useful for centralized routing (e.g., for message queues, event handling, etc.)
 */
const CustomerCommandMap = {
  GET_PROFILE: CustomerService.GetProfile
};

export default CustomerCommandMap;
