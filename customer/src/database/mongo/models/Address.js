import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

/**
 * Schema definition for storing customer addresses.
 */
const AddressSchema = new Schema({
    // Reference to the customer who owns this address
    customer: {
        type: Types.ObjectId,
        ref: 'customer',
        index: true,
        required: true
    },

    // Name associated with the address (e.g., recipient's name)
    name: {
        type: String,
        required: true,
        trim: true
    },

    // Phone number associated with the address
    phone: {
        type: String,
        required: true,
        trim: true
    },

    // Primary address line
    address1: {
        type: String,
        required: true
    },

    // Secondary address line (optional)
    address2: {
        type: String,
        default: ''
    },

    // Landmark or nearby location reference
    landmark: {
        type: String,
        required: true
    },

    // Area pin code or postal code
    pinCode: {
        type: String,
        required: true
    },

    // City name
    city: {
        type: String,
        required: true
    },

    // State or province
    state: {
        type: String,
        required: true
    },

    // Country name
    country: {
        type: String,
        required: true
    },

    // Flag to indicate if this is the default address for the customer
    isDefault: {
        type: Boolean,
        default: false
    },

    // Type of address: e.g., home or business
    type: {
        type: String,
        enum: ['home', 'business'],
        default: 'home'
    }

}, {
    timestamps: true,      // Automatically adds createdAt and updatedAt
    versionKey: false      // Disables __v field
});

// Export the model
export default mongoose.model('Address', AddressSchema);
