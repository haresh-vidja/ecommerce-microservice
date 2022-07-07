import { SellerProfile } from '../mongo/models/index.js';  // Import the SellerProfile
// Repository class for database operations related to sellers
const SellerProfileRepository = {

    // Method to create a new seller
    create: async (data) => {
        // Save the seller object to the database and return the result
        return await SellerProfile.insertMany(data)
    },

    // Method to find a seller by ID
    find: async (condition, fields = {}) => {
        // Find a seller in the database by their ID using SellerProfile
        return await SellerProfile.findOne(condition, fields);
    },

    // Method to update a seller by ID
    update: async (condition, data) => {

        // Update a seller in the database by their ID using SellerProfile
        return await SellerProfile.updateOne(condition, data);
    }

}

export default SellerProfileRepository;  // Export the SellerRepository class
