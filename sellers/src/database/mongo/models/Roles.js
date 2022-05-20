import mongoose from 'mongoose';

/**
 * Schema for role definitions within a business.
 * Roles are used to manage access permissions for sellers.
 */
const RolesSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'seller',
    index: true,               // Enables faster queries on creator
    required: true
  },

  business: {
    type: mongoose.Types.ObjectId,
    ref: 'business',
    required: true             // Ensures role is tied to a specific business
  },

  name: {
    type: String,
    required: true,            // Role name is mandatory
    trim: true
  },

  access: {
    type: [String],            // List of access slugs (e.g., ['add-user', 'manage-role'])
    default: []
  },

  isDefault: {
    type: Boolean,
    default: false             // Whether this role is auto-assigned or primary
  }

}, {
  timestamps: true,            // Automatically adds createdAt and updatedAt
  versionKey: false            // Disables __v version field
});

export default mongoose.model('roles', RolesSchema);
