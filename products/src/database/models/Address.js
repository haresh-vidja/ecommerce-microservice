import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Types.ObjectId,
        ref: 'customer'
    },
    name: String,
    mobile: String,
    address1: String,
    address2: String,
    landmark: String,
    pinCode: String,
    city: String,
    state: String,
    country: String,
    isDefault: Boolean,
    type: String
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
        }
    },
    timestamps: true,
    versionKey: false
});

export default mongoose.model('address', CustomerSchema);