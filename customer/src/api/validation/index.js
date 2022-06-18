import Schema from 'validate';

/**
 * Sends a structured 400 Bad Request JSON response when validation fails.
 *
 * @param {Array} errors - Array of validation error objects.
 * @param {Object} res - Express response object.
 * @returns {Object} - HTTP response with validation error details.
 */
function errorResponse(errors, res) {
    console.error("Validation Error:", JSON.stringify(errors, null, 2));

    // Return the first error detail (if available)
    return res.status(400).json({
        error: "Bad Request",
        message: "Validation failed",
        details: errors[0]
            ? {
                field: errors[0].path,
                message: errors[0].message
            }
            : {
                message: "Invalid request body"
            }
    });
}

/**
 * Middleware factory to validate request body against a defined schema.
 *
 * @param {Object} schema - Schema definition using `validate` package format.
 * @returns {Function} - Express middleware function.
 *
 * Usage:
 *   app.post('/api', validate(schema), handler)
 */
export default function (schema) {
    const validateSchema = new Schema(schema);

    return (req, res, next) => {
        // Perform validation
        const errors = validateSchema.validate(req.body, { strip: false });

        if (errors.length === 0) {
            // Proceed if no validation errors
            return next();
        }

        // Respond with validation errors
        return errorResponse(errors, res);
    };
}
