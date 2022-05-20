import express from 'express';
import RoleService from '../services/role.js';                    // Role business logic
import { verifyAuthToken, checkRoleAccess } from './middlewares/index.js'; // Auth middlewares
import validate from './validation/index.js';                   // Generic validation middleware
import { CreateUpdate } from './validation/role-schema.js';     // Role schema for create/update

/**
 * Initializes Role API endpoints under `/role` route.
 *
 * @param {Express.Application} app - Express application or router
 */
export default (app) => {
    const router = express.Router();

    // Apply base middleware
    router.use(verifyAuthToken);

    /**
     * @route   POST /role/create
     * @desc    Create a new role
     * @access  Protected, Requires 'add-role' access
     */
    router.post(
        '/create',
        checkRoleAccess('add-role'),
        validate(CreateUpdate),
        async (req, res, next) => {
            try {
                const data = await RoleService.Create(req.body, req.user);
                res.json(data);
            } catch (err) {
                next(err);
            }
        }
    );

    /**
     * @route   PUT /role/update/:id
     * @desc    Update an existing role
     * @access  Protected, Requires 'manage-role' access
     */
    router.put(
        '/update/:id',
        checkRoleAccess('manage-role'),
        validate(CreateUpdate),
        async (req, res, next) => {
            try {
                req.body.roleId = req.params.id;
                const data = await RoleService.Update(req.body, req.user);
                res.json(data);
            } catch (err) {
                next(err);
            }
        }
    );

    /**
     * @route   GET /role/access
     * @desc    Get access list (permissions)
     * @access  Protected, Requires 'add-role' access
     */
    router.get(
        '/access',
        checkRoleAccess('add-role'),
        async (req, res, next) => {
            try {
                const data = await RoleService.GetAccessList();
                res.json(data);
            } catch (err) {
                next(err);
            }
        }
    );

    /**
     * @route   GET /role/list
     * @desc    Get all roles (with query filters)
     * @access  Protected, Requires 'manage-role' access
     */
    router.get(
        '/list',
        checkRoleAccess('manage-role'),
        async (req, res, next) => {
            try {
                const data = await RoleService.GetRoleList(req.query, req.user);
                res.json(data);
            } catch (err) {
                next(err);
            }
        }
    );

    // Mount router at /role
    app.use('/role', router);
};
