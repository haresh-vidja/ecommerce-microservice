import CustomerService from '../services/customer.js';  // Import the CustomerService class

// Export an object with methods bound to the customerService instance
export default {
    "GET_PROFILE": CustomerService.GetProfile
};
