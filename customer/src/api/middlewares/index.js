import jwt from 'jsonwebtoken';
import { sMembers, sRem } from '../../utils/redis.js';

/**
 * Middleware to verify and authorize requests using JWT and Redis token tracking.
 *
 * 1. Extracts the token from the Authorization header.
 * 2. Verifies the token using APP_SECRET.
 * 3. Checks if the token exists in Redis (`token:<userId>` set).
 * 4. Attaches decoded payload to `req.user` if valid.
 *
 * @param {Express.Request} req - Express HTTP request object
 * @param {Express.Response} res - Express HTTP response object
 * @param {Function} next - Express `next()` middleware function
 * @returns {void}
 */
export const verifyAuthToken = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');

        // Check if Authorization header is missing or malformed
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ message: 'Authorization header missing or invalid', expired: false });
        }

        const token = authHeader.split(' ')[1];

        // Verify the JWT token
        jwt.verify(token, process.env.APP_SECRET, async (err, payload) => {
            if (err) {
                // Handle expired token: remove it from Redis
                if (err.name === 'TokenExpiredError' && payload?.id) {
                    await sRem(`token:${payload.id}`, token);
                }

                return res.status(403).json({
                    message: 'Not Authorized',
                    expired: err.name === 'TokenExpiredError'
                });
            }

            // Check if token exists in Redis token set
            const tokenExists = await sMembers(`token:${payload.id}`, token);

            if (tokenExists.length > 0) {
                req.user = payload; // Attach decoded user info to request
                return next();
            }

            // Token has been removed or is invalid
            return res.status(403).json({ message: 'Not Authorized', expired: true });
        });
    } catch (err) {
        console.error('JWT verification error:', err.message);
        return res.status(403).json({ message: 'Not Authorized', expired: false });
    }
};
