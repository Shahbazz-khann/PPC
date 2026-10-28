const { pool } = require('../../config/db');
const { getAdminRoles } = require('../../models/Admin/roles.model');
const rolePageAccessModel = require('../../models/Admin/rolePageAccess.model');
const permissionService = require('../../services/permission.service');
const logger = require('../../utils/logger');

/**
 * Controller to fetch all roles from the database.
 */
const fetchAdminRoles = async (req, res) => {
  try {
    const roles = await getAdminRoles(req.query);
    return res.status(200).json({
      success: true,
      message: 'Roles retrieved successfully',
      data: roles,
    });
  } catch (error) {
    logger.error('Error fetching admin roles', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while retrieving roles',
    });
  }
};

/**
 * Controller to fetch the 37-page canonical permission matrix for a specific role.
 *
 * Behavior:
 * - Validates role existence in live roles table (404 if not found).
 * - For Admin: returns all 37 pages as can_access = true, is_admin_root = true, is_editable = false.
 *   (Zero database rows created or queried for Admin).
 * - For configurable roles (Management, Inspector):
 *   - Missing role/page rows default to can_access = false.
 *   - Stored rows return their explicit boolean value.
 *   - Returns full canonical 37-page matrix with labels and grouping.
 */
const getRolePageAccess = async (req, res) => {
  try {
    const { roleId } = req.params;

    const targetRole = await rolePageAccessModel.getRoleById(roleId);
    if (!targetRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    const isTargetAdmin = permissionService.hasRootAdminRole([targetRole]);
    let storedRows = [];
    if (!isTargetAdmin) {
      storedRows = await rolePageAccessModel.getAllRolePageAccessByRoleIds([roleId]);
    }

    const data = permissionService.buildRolePermissionMatrix(targetRole, storedRows);

    return res.status(200).json({
      success: true,
      message: 'Role page access retrieved successfully',
      data,
    });
  } catch (error) {
    logger.error('Error fetching role page access', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while retrieving role page access',
    });
  }
};

/**
 * Controller to atomically save page permissions for a configurable role.
 *
 * Rules:
 * - Caller must possess an ACTIVE root Admin assignment in the live PostgreSQL database.
 *   (Stale JWT role claims alone cannot authorize mutations).
 * - Target Admin permissions are IMMUTABLE -> 403 Forbidden.
 * - Nonexistent target role -> 404 Not Found.
 * - Atomic execution inside a single PostgreSQL transaction (BEGIN ... UPSERT ... COMMIT / ROLLBACK).
 * - Safe parameterized query with conflict resolution ON CONFLICT (role_id, page_key) DO UPDATE.
 * - Audit actor and update timestamp recorded; creation timestamp preserved.
 * - Returns committed database state.
 */
const updateRolePageAccess = async (req, res) => {
  let client;
  try {
    const { roleId } = req.params;
    const currentUserId = req.user?.user_id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // 1. Live database authorization: caller must actively hold root Admin in PostgreSQL
    const liveCallerRoles = await rolePageAccessModel.getLiveActiveRolesByUserId(currentUserId);
    const isCallerActiveAdmin = permissionService.hasRootAdminRole(liveCallerRoles);
    if (!isCallerActiveAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only active root Admin users are authorized to modify role permissions',
      });
    }

    // 2. Resolve target role dynamically from DB
    const targetRole = await rolePageAccessModel.getRoleById(roleId);
    if (!targetRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    // 3. Admin Root Self-Protection: target Admin role is immutable
    const isTargetAdmin = permissionService.hasRootAdminRole([targetRole]);
    if (isTargetAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin permissions are immutable and cannot be modified',
      });
    }

    // 4. Atomic PostgreSQL transaction using a single acquired connection
    client = await pool.connect();
    await client.query('BEGIN');

    await rolePageAccessModel.upsertRolePageAccess(
      roleId,
      req.validatedBody.permissions,
      currentUserId,
      client
    );

    await client.query('COMMIT');

    // 5. Structured audit logging (no secrets or raw SQL exposed)
    logger.info('Role page access updated', {
      role_id: roleId,
      updated_by: currentUserId.toString(),
      updated_count: req.validatedBody.permissions.length,
    });

    // 6. Retrieve committed state from DB and return standard PPC response
    const committedRows = await rolePageAccessModel.getAllRolePageAccessByRoleIds([roleId]);
    const data = permissionService.buildRolePermissionMatrix(targetRole, committedRows);

    return res.status(200).json({
      success: true,
      message: 'Role page access updated successfully',
      data,
    });
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        logger.error('Error during transaction rollback', rollbackErr);
      }
    }
    logger.error('Error updating role page access', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while updating role page access',
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  getAdminRoles: fetchAdminRoles,
  getRolePageAccess,
  updateRolePageAccess,
};
