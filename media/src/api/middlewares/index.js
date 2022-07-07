import jwt from 'jsonwebtoken';
import { sMembers, sRem } from '../../utils/redis.js';
import { logger } from '../../utils/logs.js';

const appLog = logger.logs('seller-service'); // Initialize a logger for the seller-service

/**
 * Middleware: Verifies JWT token for authentication.
 * - Checks validity and expiry of the token
 * - Ensures token exists in Redis store (for logout/invalidation tracking)
 * - Adds decoded payload to req.user on success
 */
export const verifyAuthToken = async (req, res, next) => {
    try {
        const authHeader = req.get("Authorization");

        // Validate Authorization header
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: 'Authorization token missing or malformed' });
        }

        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.APP_SECRET, async (err, payload) => {
            if (err) {
                // If token is expired, attempt to remove it from Redis
                if (err.name === "TokenExpiredError" && payload?.id) {
                    await sRem(`sellerToken:${payload.id}`, token);
                }

                appLog.warn("JWT verification failed", { error: err.message, token });
                return res.status(403).json({
                    message: 'Not Authorized',
                    expired: err.name === 'TokenExpiredError',
                });
            }

            // Check if token exists in Redis (indicates it's still valid)
            const tokenExists = await sMembers(`sellerToken:${payload.id}`, token);

            if (tokenExists.length > 0) {
                req.user = payload; // Add user info to request object
                return next(); // Proceed to next middleware/route
            } else {
                appLog.info("Unauthorized access - token not found in Redis", { token, userId: payload.id });
                return res.status(403).json({
                    message: 'Not Authorized',
                    expired: true,
                });
            }
        });
    } catch (err) {
        appLog.error("Unexpected error during token verification", err);
        return res.status(403).json({ message: 'Not Authorized', expired: false });
    }
};

/**
 * Middleware Factory: Verifies if user has required role-based access.
 * @param {string} access - The access role to validate against
 * @returns {function} Middleware function
 */
export const checkRoleAccess = (access) => {
    return async (req, res, next) => {
        try {
            const profileId = req?.user?.profileId;

            if (!profileId) {
                appLog.warn("Missing profileId on user object");
                return res.status(403).json({ message: 'Not Authorized', expired: false });
            }

            const hasAccess = await sMembers(`sellerRole:${profileId}`, access);

            if (hasAccess.length > 0) {
                return next(); // User has required access
            } else {
                appLog.info("Unauthorized role access attempt", { access, user: req.user });
                return res.status(403).json({ message: 'Not Authorized', expired: false });
            }
        } catch (error) {
            appLog.error("Error during role access check", error);
            return res.status(403).json({ message: 'Not Authorized', expired: false });
        }
    };
};
