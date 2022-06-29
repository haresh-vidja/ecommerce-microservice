import jwt from 'jsonwebtoken';

// Middleware to verify authentication token (JWT)
export const verifyAuthToken = async (req, res, next) => {
    try {
        // Extract the JWT token from the Authorization header (Bearer token)
        const signature = req.get("Authorization");
        // Verify and decode the JWT token using the APP_SECRET from environment variables
        const payload = await jwt.verify(signature.split(" ")[1], process.env.APP_SECRET);
        // Attach the decoded payload (user information) to the request object for use in subsequent middleware/route handlers
        req.user = payload;
        next(); // Proceed to the next middleware/route handler
    } catch (err) {
        // If an error occurs during JWT verification (token expired, invalid signature, etc.), respond with a 403 Forbidden status and JSON error message
        return res.status(403).json({ message: 'Not Authorized' });
    }
}
