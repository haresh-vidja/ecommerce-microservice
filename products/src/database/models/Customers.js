import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    mobile: String,
    profileImage: String,
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
        default: 'active'
    },
    token: [String]
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
        }
    },
    timestamps: true,
    versionKey: false
});

export default mongoose.model('customers', CustomerSchema);