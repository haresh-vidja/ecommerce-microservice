import { CustomerModel } from '../mongo/models/index.js';  // Import the CustomerModel
import { User } from '../mysql/models/index.js'
// Repository class for database operations related to customers
const CustomerRepository = {

    // Method to create a new customer
    CreateCustomer: async ({ email, password, phone, salt, name }) => {
        // Create a new instance of CustomerModel with provided data
        const customer = new CustomerModel({
            email,
            password,
            salt,
            phone
        });
        // Save the customer object to the database and return the result
        return await customer.save();
    },

    // Method to find a customer by ID
    FindCustomerById: async ({ id }) => {
        // let user = await User.findAll();
        // console.log(user)
         
        // Find a customer in the database by their ID using CustomerModel
        return await CustomerModel.findById(id);
    }
}

export default CustomerRepository;  // Export the CustomerRepository class
