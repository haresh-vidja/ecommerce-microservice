import mongoose from 'mongoose';

/**
 * Schema for access control items (e.g., permissions or capabilities).
 * Represents access rights assigned to roles or users.
 */
const AccessSchema = new mongoose.Schema({
  module: {
    type: String,          // e.g., 'User', 'Product', 'Order'
    required: true
  },
  type: {
    type: String,          // e.g., 'read', 'write', 'delete'
    required: true
  },
  title: {
    type: String,          // Human-readable label for UI (e.g., 'Edit Product')
    required: true
  },
  description: {
    type: String,          // Optional longer explanation
    default: ''
  },
  slug: {
    type: String,          // Unique identifier (e.g., 'edit-product')
    required: true,
    unique: true
  }
}, {
  timestamps: true,        // Adds createdAt and updatedAt fields
  versionKey: false        // Removes __v field
});

export default mongoose.model('access', AccessSchema);
