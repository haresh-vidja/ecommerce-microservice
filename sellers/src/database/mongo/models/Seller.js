import mongoose from 'mongoose';

/**
 * Schema for seller accounts associated with a business.
 * A seller may have a role and authentication credentials.
 */
const SellerSchema = new mongoose.Schema({
  business: {
    type: mongoose.Types.ObjectId,
    ref: 'business',
    index: true,
    required: true
  },

  role: {
    type: mongoose.Types.ObjectId,
    ref: 'roles'
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },

  password: {
    type: String,
    required: true,
    select: false // Exclude password by default in queries
  },

  mobile: {
    type: String,
    required: true,
    trim: true
  },

  profileImage: {
    type: String,
    default: ''
  },

  verifiedEmail: {
    type: Boolean,
    default: false
  },

  verifiedMobile: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },

  token: {
    type: [String],
    default: []
  }

}, {
  toJSON: {
    transform(doc, ret) {
      delete ret.password; // Ensure password is never exposed in API responses
      return ret;
    }
  },
  timestamps: true,
  versionKey: false
});

export default mongoose.model('seller', SellerSchema);
