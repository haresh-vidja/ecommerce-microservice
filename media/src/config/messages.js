/**
 * Standardized response messages for file upload operations.
 * Useful for consistent API responses and easy localization in future.
 */
export default {
    FILE_SUCCESS: "File uploaded successfully",      // File uploaded without issues
    FILE_ERROR: "Error while uploading file",        // General error during upload
    FILE_MISSING: "No file found",                   // No file was submitted in the request
    FILE_TYPE: "Invalid file type",                  // File type is not allowed
    FILE_SIZE: "File size exceeds the allowed limit",// Single file size too large
    FILE_LIMIT: "File limit exceeded"                // Too many files uploaded
};
