import { ServiceMedia } from '../mongo/models/index.js';  // Import the ServiceMedia
// Repository class for database operations related to sellers
const ServiceMediaRepository = {

    // Method to create a new seller
    create: async (data) => {
        // Save the seller object to the database and return the result
        return await ServiceMedia.insertMany(data)
    },

    // Method to find a seller by ID
    find: async (condition, fields = {}) => {
        // Find a seller in the database by their ID using ServiceMedia
        return await ServiceMedia.findOne(condition, fields);
    },

    // Method to update a seller by ID
    update: async (condition, data) => {

        // Update a seller in the database by their ID using ServiceMedia
        return await ServiceMedia.updateOne(condition, data);
    }

}

export default ServiceMediaRepository;  // Export the SellerRepository class
