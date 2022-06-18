// Import required modules
import express from 'express';
import AddressService from '../services/address.js';
import { verifyAuthToken } from './middlewares/index.js';         // Middleware to verify user's token
import validate from './validation/index.js';                    // Generic validation middleware
import { AddAddress } from './validation/address-schema.js';     // Address schema for validation

// Exporting a function to register routes under the /address prefix
export default (app) => {
    const router = express.Router();

    // Apply authentication middleware to all address routes
    router.use(verifyAuthToken);

    /**
     * @route POST /address/add
     * @desc Add a new address for the authenticated user
     * @access Private
     */
    router.post('/add', validate(AddAddress), async (req, res, next) => {
        try {
            const userId = req.user.id;
            const addressData = req.body;
            const createdAddress = await AddressService.Create(addressData, userId);
            res.status(201).json(createdAddress); // 201: Created
        } catch (err) {
            next(err); // Pass error to global error handler
        }
    });

    /**
     * @route GET /address/list
     * @desc Get all addresses of the authenticated user
     * @access Private
     */
    router.get('/list', async (req, res, next) => {
        try {
            const addresses = await AddressService.GetAll(req.user.id);
            res.json(addresses);
        } catch (err) {
            next(err);
        }
    });

    /**
     * @route GET /address/get/:id
     * @desc Get a specific address by ID for the authenticated user
     * @access Private
     */
    router.get('/get/:id', async (req, res, next) => {
        try {
            const addressId = req.params.id;
            const userId = req.user.id;
            const address = await AddressService.Get(addressId, userId);
            res.json(address);
        } catch (err) {
            next(err);
        }
    });

    // Mount router under /address prefix
    app.use('/address', router);
};
