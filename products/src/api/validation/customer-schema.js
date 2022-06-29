import { email } from './validation-rule.js';

// Define validation schema for Signup API
export const SignUp = {
    address: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        use: { email },
        message: {
            email: "Email must have in valid format."
        }
    },
    password: {
        type: String,
        required: true,
        length: {
            min: 6,
            max: 12,
        },
        message: {
            length: "Password must have a length between 6 and 12."
        }
    },
    phone: {
        type: String,
        required: true,
        length: 10,
        message: {
            length: "Phone must have a length of 10."
        }
    }
};

// Define validation schema for Login API
export const Login = {
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
};