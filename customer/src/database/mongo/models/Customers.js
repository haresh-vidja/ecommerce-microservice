import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Schema for storing customer accounts and authentication details.
 */
const CustomerSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email format is invalid']
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{10}$/, 'Phone number must be 10 digits']
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
        enum: ['active', 'inactive', 'blocked'],
        default: 'active'
    },
    token: {
        type: [String],
        default: []
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    versionKey: false, // Disables the __v version key

    toJSON: {
        // Customize JSON output to hide sensitive fields
        transform(doc, ret) {
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
        }
    }
});

// Export model
export default mongoose.model('Customer', CustomerSchema);
