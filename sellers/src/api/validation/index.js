import Schema from 'validate';

/**
 * Constructs a standardized JSON error response for validation failures.
 *
 * @param {Array<Object>} validationErrors - Errors returned by the `validate` library.
 * @param {Object} res - Express response object.
 * @param {boolean} singleError - Flag to return only the first error or all.
 * @returns {Object} - Express JSON response with status 400.
 */
function errorResponse(validationErrors, res, singleError) {
    const formattedErrors = singleError
        ? {
            field: validationErrors[0]?.path,
            message: validationErrors[0]?.message
        }
        : validationErrors.map(err => ({
            field: err.path,
            message: err.message
        }));

    return res.status(400).json({
        error: "Bad Request",
        message: "Validation errors",
        singleError,
        details: formattedErrors
    });
}

/**
 * Middleware generator for validating request bodies against a schema.
 *
 * @param {Object} schema - Schema object used by `validate` library.
 * @param {boolean} [singleError=false] - If true, only the first validation error is returned.
 * @returns {Function} Express middleware function.
 */
export default function validateBody(schema, singleError = false) {
    const validateSchema = new Schema(schema);

    return (req, res, next) => {
        const errors = validateSchema.validate(req.body, { strip: false });

        if (errors.length === 0) {
            return next(); // Proceed if no validation errors
        }

        // Optional debug log — comment out in production
        console.debug('Validation errors:', errors);

        return errorResponse(errors, res, req.body.singleError ?? singleError);
    };
}
