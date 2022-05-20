import messages from '../../config/messages.js';
import { arrayLength } from './validation-rule.js';

/**
 * Validation schema for creating or updating roles or similar resources.
 * - Ensures `name` is present
 * - Ensures `access` is a non-empty array
 */
export const CreateUpdate = {
  name: {
    type: String,
    required: true,
    message: {
      required: messages?.VALIDATION?.REQUIRED_NAME || "Name must have value."
    }
  },
  access: {
    type: Array,
    use: { arrayLength },
    message: {
      arrayLength: messages?.VALIDATION?.ACCESS_REQUIRED || "There must be at least one access selected."
    }
  }
};
