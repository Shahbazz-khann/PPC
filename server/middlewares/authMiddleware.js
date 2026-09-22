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

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Attach decoded user information to request
        req.user = decoded;

        // Continue to controller
        next();

    } catch (error) {
        logger.warn(`Authentication failed: ${error.message}`);

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

const authorize = (...allowedAccess) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userType = req.user.user_type?.trim().toLowerCase();

        const normalizedAccess = allowedAccess.map((item) =>
            item.trim().toLowerCase()
        );

        // Allow based on User Type (customer, employee, service provider)
        if (userType && normalizedAccess.includes(userType)) {
            return next();
        }

        // Employee role check (admin, management, inspector)
        // Only valid when the user's type is 'employee'
        if (userType === 'employee') {
            const userRoles = req.user.roles || [];
            
            const hasRequiredRole = userRoles.some(role => 
                normalizedAccess.includes(role.trim().toLowerCase())
            );

            if (hasRequiredRole) {
                return next();
            }
        }

        return res.status(403).json({
            success: false,
            message: 'You are not authorized to access this resource'
        });
    };
};
module.exports = {
    authenticate,
    authorize
};