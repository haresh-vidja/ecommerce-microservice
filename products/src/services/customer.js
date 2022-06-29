import { CustomerRepository } from "../database/repository/index.js";  // Import the CustomerRepository

// Business logic for customer-related operations
const CustomerService = {

    /**
     * Method to handle user sign-up
     * @param {Object} userInputs 
     * @returns Object
     */
    SignUp: async (userInputs) => {
        
        // Create a new customer in the repository
        const existingCustomer = await CustomerRepository.CreateCustomer(userInputs);

        console.log(existingCustomer);  // Log the created customer

        // Return a success response with the new customer's ID
        return { data: { id: existingCustomer._id }, type: "success", message: "" };
    },

    /**
     * Method to get customer profile by ID
     * @param {Object} param 
     * @returns Object
     */
    GetProfile: async ({ id }) => {
        // Find the customer by ID in the repository
        const existingCustomer = await CustomerRepository.FindCustomerById({ id });

        // Return a success response with the customer data
        return { data: existingCustomer, type: "success", message: "" };
    }

}

export default CustomerService;  // Export the CustomerService class
