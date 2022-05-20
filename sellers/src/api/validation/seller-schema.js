import { email, objectid } from './validation-rule.js';

/**
 * Validation schema for user self-registration (SignUp)
 */
export const SignUp = {
  name: {
    type: String,
    required: true,
    message: {
      required: "Name must have value."
    }
  },
  email: {
    type: String,
    required: true,
    use: { email },
    message: {
      required: "Email is required.",
      email: "Email must be in a valid format."
    }
  },
  password: {
    type: String,
    required: true,
    length: { min: 6, max: 12 },
    message: {
      required: "Password is required.",
      length: "Password must be between 6 and 12 characters."
    }
  }
};

/**
 * Validation schema for user login (Login)
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

/**
 * Validation schema for admin-created user (Create)
 */
export const Create = {
  name: {
    type: String,
    required: true,
    message: {
      required: "Name must have value."
    }
  },
  email: {
    type: String,
    required: true,
    use: { email },
    message: {
      required: "Email is required.",
      email: "Email must be in a valid format."
    }
  },
  password: {
    type: String,
    required: true,
    length: { min: 6, max: 12 },
    message: {
      required: "Password is required.",
      length: "Password must be between 6 and 12 characters."
    }
  },
  roleId: {
    type: String,
    required: true,
    use: { objectid },
    message: {
      required: "Role must be selected.",
      objectid: "Role ID must be a valid ObjectId."
    }
  }
};
