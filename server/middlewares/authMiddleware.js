const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { isValidPageKey } = require('../config/adminPageRegistry');
const rolePageAccessModel = require('../models/Admin/rolePageAccess.model');
const permissionService = require('../services/permission.service');

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

/**
 * Middleware factory for canonical page-level access authorization.
 *
 * Enforcement logic:
 * 1. Requires authenticated employee (req.user exists with user_id).
 * 2. Resolves caller's active roles from live database (immune to stale JWTs).
 * 3. Identifies root Admin dynamically -> bypasses database permission checks.
 * 4. For configurable roles (Management, Inspector):
 *    - On GET / HEAD: allows access if user has direct page access OR approved support-read access.
 *    - On mutations (POST, PUT, PATCH, DELETE): strictly requires DIRECT page access.
 *      (Support-read NEVER authorizes mutating operations).
 * 5. Rejects unauthorized access with 403 Forbidden (fails closed).
 *
 * @param {string} pageKey - Canonical page key from ADMIN_PAGE_REGISTRY
 * @returns {Function} Express middleware function
 */
const authorizePageAccess = (pageKey) => {
    // Validate canonical page key at route setup time
    if (!isValidPageKey(pageKey)) {
        throw new Error(`authorizePageAccess configuration error: Invalid canonical page key "${pageKey}"`);
    }

    return async (req, res, next) => {
        try {
            // 1. Mandatory authentication check
            if (!req.user || !req.user.user_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Check employee user type
            const userType = req.user.user_type?.trim().toLowerCase();
            if (userType !== 'employee') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: You do not have permission to access this resource'
                });
            }

            const userId = req.user.user_id.toString();

            // 2. Resolve live active roles from DB (cached on req._ppcLiveRoles for current request lifecycle)
            let liveRoles = req._ppcLiveRoles;
            if (!liveRoles) {
                liveRoles = await rolePageAccessModel.getLiveActiveRolesByUserId(userId);
                req._ppcLiveRoles = liveRoles;
            }

            if (!liveRoles || liveRoles.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: You do not have permission to access this resource'
                });
            }

            // 3. Dynamic root Admin bypass
            const isRootAdmin = permissionService.hasRootAdminRole(liveRoles);
            if (isRootAdmin) {
                req.user.liveRoles = liveRoles;
                req.user.isRootAdmin = true;
                return next();
            }

            // 4. Configurable roles evaluation
            const isReadRequest = req.method === 'GET' || req.method === 'HEAD';
            let hasAccess = false;

            if (isReadRequest) {
                // Read requests can use direct access OR approved support-read ancestor access
                hasAccess = await permissionService.resolveSupportReadAccess(liveRoles, pageKey);
            } else {
                // Mutation requests strictly require direct page access (support-read is read-only)
                hasAccess = await permissionService.resolvePageAccess(liveRoles, pageKey);
            }

            if (hasAccess) {
                req.user.liveRoles = liveRoles;
                req.user.isRootAdmin = false;
                return next();
            }

            // 5. Explicit denial
            logger.warn('Page access denied', {
                user_id: userId,
                page_key: pageKey,
                method: req.method,
                path: req.originalUrl || (req.baseUrl ? req.baseUrl + req.path : req.path)
            });

            return res.status(403).json({
                success: false,
                message: 'Access denied: You do not have permission to access this resource'
            });
        } catch (error) {
            logger.error('Error during page authorization check', error);
            return res.status(500).json({
                success: false,
                message: 'An unexpected error occurred while verifying permissions'
            });
        }
    };
};

module.exports = {
    authenticate,
    authorize,
    authorizePageAccess
};