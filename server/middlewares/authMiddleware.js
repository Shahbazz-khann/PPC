const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authenticate = (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        // Check if token exists
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token is required'
            });
        }

        // Check Bearer format
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication format'
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];
console.log('JWT SECRET EXISTS IN MIDDLEWARE:', !!process.env.JWT_SECRET);
        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
console.log('JWT SECRET EXISTS IN MIDDLEWARE:', !!process.env.JWT_SECRET);
        // Attach decoded user information to request
        req.user = decoded;

        // Continue to controller
        next();

    } catch (error) {
        logger.error('Authentication error:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Authentication token has expired'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

    const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userRole = req.user.role_name?.trim().toLowerCase();

        const normalizedRoles = allowedRoles.map((role) =>
            role.trim().toLowerCase()
        );

        // Phase 1A: Allow new 'user' role to access owner and customer routes
        if (normalizedRoles.includes('owner') || normalizedRoles.includes('customer')) {
            if (!normalizedRoles.includes('user')) {
                normalizedRoles.push('user');
            }
        }

        if (!normalizedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to access this resource'
            });
        }

        next();
    };
};
module.exports = {
    authenticate,
    authorize
};