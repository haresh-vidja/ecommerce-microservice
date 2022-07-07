import mongoose from 'mongoose';

/**
 * Mongoose schema for storing service-related media uploads.
 * This schema captures file metadata, ownership, and file handling status.
 */
const MediaSchema = new mongoose.Schema({

    // Reference to the associated business (if applicable)
    business: {
        type: mongoose.Types.ObjectId,
        ref: 'Business' // Optional: for population if needed
    },

    // Reference to the seller who uploaded the file
    seller: {
        type: mongoose.Types.ObjectId,
        ref: 'Seller'  // Optional: for population if needed
    },

    // File metadata
    uploadedFilename: { type: String },   // Stored file name (e.g., renamed or UUID)
    originalFilename: { type: String },   // Original file name from user upload
    mimetype: { type: String },           // MIME type of the file (e.g., image/png)
    size: { type: Number },               // File size in bytes
    type: { type: String },               // Custom type tag (e.g., 'banner', 'portfolio')

    // File paths or URLs
    thumbnail: { type: String },          // Public path or URL to the thumbnail image
    uploadedFile: { type: String },       // Public path or URL to the uploaded file
    thumbnailFile: { type: String },      // Optional thumbnail file name (if different from URL)

    // Upload status
    status: {
        type: String,
        default: 'uploaded',
        enum: ['uploaded', 'processing', 'failed', 'deleted'] // Optional: restrict to known states
    }

}, {
    timestamps: true,     // Adds createdAt and updatedAt fields automatically
    versionKey: false     // Removes the __v versioning field from documents
});

// Export the model with collection name 'service_media'
export default mongoose.model('service_media', MediaSchema);
