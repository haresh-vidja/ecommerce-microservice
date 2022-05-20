import mongoose from 'mongoose';

/**
 * Schema representing a registered business entity.
 */
const BusinessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    lowercase: true,
    required: true,
    unique: true // Ensures one business per email
  },

  mobile: {
    type: String,
    required: true,
    unique: true
  },

  landline: {
    type: String,
    default: ''
  },

  // Address fields
  address1: { type: String },
  address2: { type: String },
  landmark: { type: String },
  pinCode: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },

  // Business classification (e.g., ['service', 'plans'])
  type: {
    type: [String],
    default: []
  },

  gstNumber: { type: String },
  panNumber: { type: String },

  // Verification flags
  verifiedEmail: {
    type: Boolean,
    default: false
  },
  verifiedMobile: {
    type: Boolean,
    default: false
  },
  verifiedBusiness: {
    type: Boolean,
    default: false
  },

  // Account status
  status: {
    type: String,
    enum: ['pending', 'active', 'rejected', 'suspended'],
    default: 'pending'
  }

}, {
  timestamps: true,     // Automatically adds createdAt and updatedAt
  versionKey: false     // Disables the __v version key
});

export default mongoose.model('business', BusinessSchema);
