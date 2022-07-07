import mongoose from 'mongoose';

// Define schema for seller-related media uploads
const MediaSchema = new mongoose.Schema({
    // Reference to business entity (if applicable)
    business: {
        type: mongoose.Types.ObjectId,
        ref: 'Business' // Optional: Add ref if using population
    },

    // Reference to seller (uploader or owner)
    seller: {
        type: mongoose.Types.ObjectId,
        ref: 'Seller' // Optional: Add ref if using population
    },

    // File metadata
    uploadedFilename: { type: String },           // Unique or renamed file name on server/cloud
    originalFilename: { type: String },           // Original file name from user upload
    mimetype: { type: String },                   // MIME type of the uploaded file
    size: { type: Number },                       // File size in bytes
    type: { type: String },                       // Custom type indicator (e.g., 'profile', 'document')

    // File storage paths/URLs
    thumbnail: { type: String },                  // URL or path to thumbnail image
    uploadedFile: { type: String },               // Path or URL to main uploaded file
    thumbnailFile: { type: String },              // Optional thumbnail file name if separate

    // Upload status
    status: {
        type: String,
        default: 'uploaded',                      // e.g., 'uploaded', 'pending', 'deleted'
        enum: ['uploaded', 'pending', 'deleted']  // Optional: strict allowed statuses
    },

    // Cloud storage flag
    isCloud: {
        type: Boolean,
        default: false                            // Indicates if file is stored on cloud
    }

}, {
    timestamps: true,                             // Adds createdAt and updatedAt fields
    versionKey: false                             // Disables __v version field
});

// Export as Mongoose model named 'seller_profile'
export default mongoose.model('seller_profile', MediaSchema);
