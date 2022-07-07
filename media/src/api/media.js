import MediaService from '../services/media.js';             // Service responsible for handling media upload logic
import { verifyAuthToken } from './middlewares/index.js';    // Middleware to verify JWT token
import { fileValidate } from './validation/index.js';        // Function to validate file types and upload rules

/**
 * Registers media upload routes to the provided Express app or router.
 *
 * @param {Express.Router|Express.Application} app - The Express router or app instance.
 */
export default (app) => {

    // 🔐 Apply authentication middleware to secure all media routes
    app.use(verifyAuthToken);

    /**
     * @route   POST /upload/:type
     * @desc    Handles file uploads (e.g., profile images, service documents, etc.)
     * @access  Protected (JWT required)
     * @param   {string} :type - Upload category (e.g., profile, service, pdf, csv)
     */
    app.post('/upload/:type', async (req, res, next) => {
        try {
            // Initialize a formidable form with validation based on upload type
            const form = fileValidate(req.params.type);

            // Pass the form handler and request to the MediaService for processing
            const result = await MediaService.Upload(form, req);

            // Return successful upload response
            res.status(200).json(result);
        } catch (error) {
            // Delegate error to Express error-handling middleware
            next(error);
        }
    });
};
