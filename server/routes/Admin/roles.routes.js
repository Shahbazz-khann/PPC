const express = require('express');
const router = express.Router();
const {
  getAdminRoles,
  getRolePageAccess,
  updateRolePageAccess,
} = require('../../controller/Admin/roles.controller');
const {
  validateGetRolePageAccess,
  validatePutRolePageAccess,
} = require('../../validators/Admin/roles.validator');
const { authenticate, authorize, authorizePageAccess } = require('../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../config/adminPageRegistry');

/**
 * GET /api/v1/admin/roles
 * List all roles for Admin directory / selection.
 * Governed by PAGE_ADMIN_ROLES.
 */
router.get(
  '/',
  authenticate,
  authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_ADMIN_ROLES),
  getAdminRoles
);

/**
 * GET /api/v1/admin/roles/:roleId/page-access
 * Retrieve the 37-page canonical permission matrix for a specific role.
 * Governed by PAGE_ADMIN_ROLES.
 */
router.get(
  '/:roleId/page-access',
  authenticate,
  authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_ADMIN_ROLES),
  validateGetRolePageAccess,
  getRolePageAccess
);

/**
 * PUT /api/v1/admin/roles/:roleId/page-access
 * Atomically save page permissions for a configurable role.
 * Root Admin live database authorization enforced in controller.
 * Restricted to root Admin only (immutability and self-protection preserved).
 */
router.put(
  '/:roleId/page-access',
  authenticate,
  authorize('admin'),
  validatePutRolePageAccess,
  updateRolePageAccess
);

module.exports = router;
