// Centralized export of all repository modules
import CustomerRepository from './customer.js';
import AddressRepository from './address.js';

// Export all repositories as named exports
export {
  CustomerRepository,
  AddressRepository
};

// Optionally, export as default in case someone prefers importing the whole repo object
export default {
  CustomerRepository,
  AddressRepository
};
