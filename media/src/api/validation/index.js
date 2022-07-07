import Schema from 'validate';
import path from 'path';
const __dirname = path.resolve();
import formidable, { errors as formidableErrors } from 'formidable';

/**
 * Constructs and sends a standardized JSON response for validation errors.
 *
 * @param {Object[]} validate - Array of validation errors from `validate` library.
 * @param {Object} res - Express.js response object.
 * @param {boolean} singleError - Whether to return only a single error or multiple.
 * @returns {Object} JSON response with error details.
 */
function errorResponse(validate, res, singleError) {
    let errors;

    if (!singleError) {
        // Return multiple field-level errors
        errors = validate.map(err => ({
            field: err.path,
            message: err.message
        }));
    } else {
        // Return only the first error
        errors = {
            field: validate[0].path,
            message: validate[0].message
        };
    }

    return res.status(400).json({
        error: "Bad Request",
        message: "Validation errors",
        singleError,
        details: errors
    });
}

/**
 * Middleware: Validates incoming request body against the provided schema.
 *
 * @param {Object} schema - Validation schema using `validate` library.
 * @param {boolean} singleError - Whether to return just the first error or all errors.
 * @returns {Function} Express middleware function.
 */
export const validate = (schema, singleError = false) => {
    const validateSchema = new Schema(schema);

    return (req, res, next) => {
        const errors = validateSchema.validate(req.body, { strip: false });

        if (errors.length === 0) {
            return next(); // Proceed if no validation errors
        } else {
            console.warn("Validation Error:", errors);
            return errorResponse(errors, res, req.body.singleError || singleError);
        }
    };
};

// Default options for all file uploads
const defaultFileOption = {
    uploadDir: `${__dirname}/public/temp`,        // Temp directory for file uploads
    keepExtensions: true,                         // Retain original file extensions
    maxFiles: 10,                                 // Max files allowed per request
    maxFileSize: 5 * 1024 * 1024,                 // Max size per file: 5MB
    maxTotalFileSize: 30 * 1024 * 1024            // Max total upload size: 30MB
};

// Allowed MIME types for different file categories
const fileFilterType = {
    profile: ['image/jpeg', 'image/jpg', 'image/png'],
    service: ['image/jpeg', 'image/jpg', 'image/png'],
    csv: ['text/csv', 'application/vnd.ms-excel'],
    pdf: ['application/pdf'],
    default: [
        'image/jpeg', 'image/jpg', 'image/png',
        'application/pdf', 'text/csv', 'application/vnd.ms-excel'
    ]
};

// Custom options for specific file upload categories
const customOption = {
    profile: {
        maxFiles: 1,
        maxFileSize: 2 * 1024 * 1024 // 2MB max for profile images
    },
    service: {
        maxFiles: 5,
        maxFileSize: 2 * 1024 * 1024 // 2MB per file for service images
    }
};

/**
 * Creates a `formidable` instance configured for the specified upload type.
 * Validates file types and enforces type-specific upload constraints.
 *
 * @param {string} type - Upload category type (e.g., 'profile', 'csv', 'pdf').
 * @returns {IncomingForm} A formidable form instance configured for upload.
 */
export const fileValidate = (type) => {
    const allowedTypes = fileFilterType[type] || fileFilterType.default;
    const custom = customOption[type] || {};

    const form = formidable({
        ...defaultFileOption,
        ...custom,
        filter: ({ mimetype }) => {
            const isValid = allowedTypes.includes(mimetype);

            if (!isValid) {
                form.emit('error', new formidableErrors.default('Invalid file type', 1, 400));
            }

            return isValid;
        }
    });

    return form;
};
