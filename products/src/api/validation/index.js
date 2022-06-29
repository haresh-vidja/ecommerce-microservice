import Schema from 'validate'

/**
 * Constructs a JSON response for validation errors and sets the HTTP status to 400 (Bad Request).
 * 
 * @param {Object} validate - The Ajv validation object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} - The formatted error response.
 */
function errorResponse(validate, res) {
    console.log(JSON.stringify(validate.errors, null, 2));
    return res.status(400).json({
        error: "Bad Request",
        message: "Validation errors",
        details: {
            field: validate[0].path,
            message: validate[0].message
        }
    });
}

/**
 * Generic middleware for validating request bodies against a provided schema.
 * Validates the schema against the request body and proceeds to the next middleware if valid.
 * Otherwise, sends a 400 Bad Request response with validation error details.
 * 
 * @param {Object} schema - The JSON schema to validate against.
 * @returns {Function} - The middleware function.
 */
export default function (schema) {
    const validateSchema = new Schema(schema);
    return (req, res, next) => {
        const errors = validateSchema.validate(req.body, {strip: false})
        if (errors.length == 0) {
            next();
        } else {
            return errorResponse(errors, res);
        }
    };
}
