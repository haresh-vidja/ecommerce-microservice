import SellerService from '../services/seller.js';  // Seller service layer
import { verifyAuthToken, checkRoleAccess } from './middlewares/index.js';  // Auth and access middlewares
import validate from './validation/index.js';       // Generic validation middleware
import { SignUp, Login, Create } from './validation/seller-schema.js'; // Request body schemas

/**
 * Initializes seller-related routes under the current app/router context.
 *
 * @param {Express.Application | Express.Router} app - Express app or router instance.
 */
export default (app) => {

    // Public Routes

    /**
     * @route   POST /signup
     * @desc    Register a new seller
     * @access  Public
     */
    app.post('/signup', validate(SignUp), async (req, res, next) => {
        try {
            const data = await SellerService.SignUp(req.body);
            res.json(data);
        } catch (err) {
            next(err);
        }
    });

    /**
     * @route   POST /login
     * @desc    Authenticate and log in a seller
     * @access  Public
     */
    app.post('/login', validate(Login, true), async (req, res, next) => {
        try {
            const data = await SellerService.SignIn(req.body);
            res.json(data);
        } catch (err) {
            next(err);
        }
    });

    // Protected Routes - Require Auth

    // Apply auth middleware globally to all routes below
    app.use(verifyAuthToken);

    /**
     * @route   POST /create
     * @desc    Admin creates a new seller
     * @access  Protected - Requires 'add-user' permission
     */
    app.post('/create', checkRoleAccess('add-user'), validate(Create), async (req, res, next) => {
        try {
            const data = await SellerService.Create(req.body, req.user);
            res.json(data);
        } catch (err) {
            next(err);
        }
    });

    /**
     * @route   GET /list
     * @desc    Get a list of sellers (with optional filters)
     * @access  Protected - Requires 'manage-user' permission
     */
    app.get('/list', checkRoleAccess('manage-user'), async (req, res, next) => {
        try {
            const data = await SellerService.GetSellerList(req.query, req.user);
            res.json(data);
        } catch (err) {
            next(err);
        }
    });

};
