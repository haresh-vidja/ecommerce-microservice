import { email } from './validation-rule.js'; // Custom email validator

/**
 * Validation schema for Customer Signup API
 */
export const SignUp = {
    firstName: {
        type: String,
        required: true,
        message: {
            required: "First name is required."
        }
    },
    lastName: {
        type: String,
        required: true,
        message: {
            required: "Last name is required."
        }
    },
    email: {
        type: String,
        required: true,
        use: { email }, // Custom rule to validate email format
        message: {
            required: "Email is required.",
            email: "Email must be in valid format."
        }
    },
    password: {
        type: String,
        required: true,
        length: {
            min: 6,
            max: 12
        },
        message: {
            required: "Password is required.",
            length: "Password must be between 6 and 12 characters."
        }
    },
    phone: {
        type: String,
        required: true,
        length: 10,
        message: {
            required: "Phone number is required.",
            length: "Phone number must be exactly 10 digits."
        }
    }
};

/**
 * Validation schema for Customer Login API
 */
export const Login = {
    username: {
        type: String,
        required: true,
        message: {
            required: "Username is required."
        }
    },
    password: {
        type: String,
        required: true,
        message: {
            required: "Password is required."
        }
    }
};
