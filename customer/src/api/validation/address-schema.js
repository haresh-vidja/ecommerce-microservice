// Define validation schema for Add Address API
export const AddAddress = {
    name: {
        type: String,
        required: true,
        message: "Name is required"
    },
    mobile: {
        type: String,
        required: true,
        length: 10,
        message: {
            required: "Mobile number is required",
            length: "Mobile number must be exactly 10 digits"
        }
    },
    address1: {
        type: String,
        required: true,
        message: "Address Line 1 is required"
    },
    landmark: {
        type: String,
        required: true,
        message: "Landmark is required"
    },
    pinCode: {
        type: String,
        required: true,
        message: "Pin Code is required"
    },
    city: {
        type: String,
        required: true,
        message: "City is required"
    },
    state: {
        type: String,
        required: true,
        message: "State is required"
    },
    country: {
        type: String,
        required: true,
        message: "Country is required"
    },
    isDefault: {
        type: Boolean,
        required: true,
        message: "isDefault must be specified (true or false)"
    },
    type: {
        type: String,
        enum: ['home', 'business'],
        message: "Type must be either 'home' or 'business'"
    }
};
