// Import required modules and middleware
import express from 'express';
import CustomerService from '../services/customer.js';             // Business logic for customer operations
import { verifyAuthToken } from './middlewares/index.js';          // Middleware to authenticate JWT
import validate from './validation/index.js';                      // Generic validation middleware
import { SignUp, Login } from './validation/customer-schema.js';   // Validation schemas

export default (app) => {
    const router = express.Router();

    // Apply auth middleware to secure routes below
    router.use(verifyAuthToken);

    /**
     * @route POST /customer/signup
     * @desc Register a new customer
     * @access Public
     */
    router.post('/signup', validate(SignUp), async (req, res, next) => {
        try {
            const userData = req.body;
            const result = await CustomerService.SignUp(userData);
            res.status(201).json(result); // 201: Created
        } catch (err) {
            next(err);
        }
    });

    /**
     * @route POST /customer/login
     * @desc Authenticate customer and return token
     * @access Public
     */
    router.post('/login', validate(Login), async (req, res, next) => {
        try {
            const credentials = req.body;
            const result = await CustomerService.SignIn(credentials);
            res.json(result);
        } catch (err) {
            next(err);
        }
    });

    /**
     * @route GET /customer/profile/:id
     * @desc Get profile of a specific customer (authenticated)
     * @access Private
     */
    router.get('/profile/:id', async (req, res, next) => {
        try {
            const profile = await CustomerService.GetProfile(req.params.id);
            res.json(profile);
        } catch (err) {
            next(err);
        }
    });

    // Mount the router under /customer prefix
    app.use('/customer', router);
};
