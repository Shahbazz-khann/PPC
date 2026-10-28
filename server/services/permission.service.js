const {
  ADMIN_PAGE_KEYS,
  ADMIN_PAGE_REGISTRY,
  ADMIN_PAGE_REGISTRY_MAP,
  SUPPORT_READ_MAP,
  isValidPageKey,
  getPageConfig,
  getSupportReadDependencies,
  getPagesNeedingSupportRead,
} = require('../config/adminPageRegistry');

const rolePageAccessModel = require('../models/Admin/rolePageAccess.model');

/**
 * @file permission.service.js
 * @description Business-level RBAC and Page Permission Resolution Service.
 * Implements the approved T2 architecture:
 * 1. Validates canonical page keys against adminPageRegistry (fails closed on unknown keys).
 * 2. Enforces root Admin code bypass dynamically (role_english.toLowerCase() === 'admin').
 * 3. Enforces default-deny for missing role_page_access rows.
 * 4. Multi-role resolution: Union of active role grants (ANY active role grant wins).
 * 5. Inactive roles (is_active === false) are strictly excluded from granting access.
 * 6. Directional support-read evaluation for read-only reference data access.
 * 7. BIGINT role IDs preserved as strings without numeric conversion.
 */

/**
 * Normalizes input roles into an array of validated role objects.
 * Accepts either:
 * - Array of role objects: [{ role_id: '1', role_english: 'Management', is_active: true }]
 * - Array of string role IDs: ['1', '2'] (queries live roles table to resolve active status)
 * @param {Array<object|string>} rolesInput
 * @param {object} [dbClient] - Optional dbClient for transaction isolation
 * @returns {Promise<Array<{role_id: string, role_english: string, is_active: boolean}>>}
 */
const normalizeActiveRoles = async (rolesInput, dbClient) => {
  if (!Array.isArray(rolesInput) || rolesInput.length === 0) {
    return [];
  }

  // If already array of role objects with role_english
  if (typeof rolesInput[0] === 'object' && rolesInput[0] !== null && 'role_id' in rolesInput[0]) {
    return rolesInput
      .filter((r) => r && r.is_active === true)
      .map((r) => ({
        role_id: r.role_id.toString(),
        role_english: r.role_english || '',
        is_active: Boolean(r.is_active),
      }));
  }

  // If array of string/bigint role IDs, resolve dynamically from DB
  const roleIds = rolesInput.map((id) => id.toString());
  const liveRoles = await rolePageAccessModel.getLiveRolesByIds(roleIds, dbClient);
  return liveRoles
    .filter((r) => r.is_active === true)
    .map((r) => ({
      role_id: r.role_id.toString(),
      role_english: r.role_english || '',
      is_active: Boolean(r.is_active),
    }));
};

/**
 * Check if the active roles include the root Admin role.
 * Root Admin is identified dynamically by role name (case-insensitive),
 * not by hardcoded numeric ID.
 * @param {Array<{role_id: string, role_english: string, is_active: boolean}>>} activeRoles
 * @returns {boolean}
 */
const hasRootAdminRole = (activeRoles) => {
  return activeRoles.some(
    (r) => r.is_active === true && typeof r.role_english === 'string' && r.role_english.trim().toLowerCase() === 'admin'
  );
};

/**
 * Resolve direct page access for given roles on a canonical page key.
 *
 * Evaluation rules:
 * - If pageKey is not in canonical registry -> DENIED (false)
 * - If no active roles provided -> DENIED (false)
 * - If any active role is root Admin -> ALLOWED (true, code bypass)
 * - If configurable roles: queries role_page_access.
 *   - Any active role with can_access === true -> ALLOWED (true)
 *   - Missing row or can_access === false -> DENIED (false)
 *
 * @param {Array<object|string>} rolesInput - Array of role objects or string role IDs
 * @param {string} pageKey - Canonical page key
 * @param {object} [dbClient] - Optional dbClient for transaction isolation
 * @returns {Promise<boolean>}
 */
const resolvePageAccess = async (rolesInput, pageKey, dbClient) => {
  // 1. Validate canonical page key (must fail closed if unknown)
  if (!isValidPageKey(pageKey)) {
    return false;
  }

  // 2. Normalize and filter active roles
  const activeRoles = await normalizeActiveRoles(rolesInput, dbClient);
  if (activeRoles.length === 0) {
    return false;
  }

  // 3. Root Admin bypass
  if (hasRootAdminRole(activeRoles)) {
    return true;
  }

  // 4. Query role_page_access for active configurable roles
  const roleIds = activeRoles.map((r) => r.role_id);
  const rows = await rolePageAccessModel.getRolePageAccessByRoleIds(roleIds, pageKey, dbClient);

  // 5. Union of grants across active roles (ANY-role grant)
  // Missing row represents no explicit grant (default deny)
  const isGranted = rows.some((row) => row.can_access === true);
  return isGranted;
};

/**
 * Resolve support-read access for a reference lookup page key.
 *
 * Evaluation rules:
 * - If targetPageKey is not in canonical registry -> DENIED (false)
 * - If user has direct page access to targetPageKey -> ALLOWED (true)
 * - If user has direct page access to ANY child page that lists targetPageKey
 *   in SUPPORT_READ_MAP -> ALLOWED (true)
 * - Directional check: access to targetPageKey does NOT grant access to child pages.
 * - This resolution applies ONLY to read/lookup support, never mutating endpoints.
 *
 * @param {Array<object|string>} rolesInput - Array of role objects or string role IDs
 * @param {string} targetPageKey - Canonical reference page key
 * @param {object} [dbClient] - Optional dbClient for transaction isolation
 * @returns {Promise<boolean>}
 */
const resolveSupportReadAccess = async (rolesInput, targetPageKey, dbClient) => {
  // 1. Validate canonical page key
  if (!isValidPageKey(targetPageKey)) {
    return false;
  }

  // 2. Direct page access check
  const directAccess = await resolvePageAccess(rolesInput, targetPageKey, dbClient);
  if (directAccess) {
    return true;
  }

  // 3. Find child pages that declare this target page as a support-read dependency
  const dependentChildKeys = getPagesNeedingSupportRead(targetPageKey);
  if (dependentChildKeys.length === 0) {
    return false;
  }

  // 4. Check if user has direct access to ANY of those dependent child pages
  for (const childKey of dependentChildKeys) {
    const hasChildAccess = await resolvePageAccess(rolesInput, childKey, dbClient);
    if (hasChildAccess) {
      return true;
    }
  }

  return false;
};

/**
 * Resolve the full set of effective page permissions for given roles across all 37 pages.
 *
 * For Root Admin:
 * - isAdminRoot: true
 * - allowedPageKeys: all 37 canonical page keys
 * - permissionsMap: all 37 keys set to true
 *
 * For Configurable Roles:
 * - isAdminRoot: false
 * - allowedPageKeys: array of keys where ANY active role has can_access === true
 * - permissionsMap: object with all 37 keys mapped to boolean (missing = false)
 *
 * @param {Array<object|string>} rolesInput - Array of role objects or string role IDs
 * @param {object} [dbClient] - Optional dbClient for transaction isolation
 * @returns {Promise<{isAdminRoot: boolean, allowedPageKeys: string[], permissionsMap: Record<string, boolean>}>}
 */
const resolveEffectivePermissions = async (rolesInput, dbClient) => {
  const activeRoles = await normalizeActiveRoles(rolesInput, dbClient);

  // If no active roles
  if (activeRoles.length === 0) {
    const emptyMap = {};
    for (const page of ADMIN_PAGE_REGISTRY) {
      emptyMap[page.key] = false;
    }
    return {
      isAdminRoot: false,
      allowedPageKeys: [],
      permissionsMap: emptyMap,
    };
  }

  // Root Admin: grants all 37 canonical pages
  if (hasRootAdminRole(activeRoles)) {
    const allKeys = ADMIN_PAGE_REGISTRY.map((p) => p.key);
    const fullMap = {};
    for (const key of allKeys) {
      fullMap[key] = true;
    }
    return {
      isAdminRoot: true,
      allowedPageKeys: allKeys,
      permissionsMap: fullMap,
    };
  }

  // Configurable Roles: union across all active roles
  const roleIds = activeRoles.map((r) => r.role_id);
  const rows = await rolePageAccessModel.getAllRolePageAccessByRoleIds(roleIds, dbClient);

  const grantedKeysSet = new Set();
  for (const row of rows) {
    if (row.can_access === true && isValidPageKey(row.page_key)) {
      grantedKeysSet.add(row.page_key);
    }
  }

  const permissionsMap = {};
  for (const page of ADMIN_PAGE_REGISTRY) {
    permissionsMap[page.key] = grantedKeysSet.has(page.key);
  }

  return {
    isAdminRoot: false,
    allowedPageKeys: Array.from(grantedKeysSet),
    permissionsMap,
  };
};

/**
 * Builds the canonical 37-page permission matrix for a single role.
 * Used by Role Management GET and PUT responses.
 *
 * Rules:
 * - If role is root Admin (identified dynamically by role_english):
 *   - returns all 37 canonical pages as can_access: true
 *   - is_admin_root: true
 *   - is_editable: false
 * - If configurable role (Management, Inspector):
 *   - missing rows default to false
 *   - stored rows with can_access = true return true
 *   - stored rows with can_access = false return false
 *   - is_admin_root: false
 *   - is_editable: true
 *
 * @param {object} role - Live role object { role_id, role_english, is_active }
 * @param {Array<{page_key: string, can_access: boolean}>} [storedRows=[]] - Stored rows from DB
 * @returns {object} Formatted role permission matrix
 */
const buildRolePermissionMatrix = (role, storedRows = []) => {
  if (!role) {
    throw new Error('buildRolePermissionMatrix requires a valid role object');
  }

  const isTargetAdmin = typeof role.role_english === 'string' && role.role_english.trim().toLowerCase() === 'admin';

  if (isTargetAdmin) {
    return {
      role_id: role.role_id.toString(),
      role_english: role.role_english,
      is_admin_root: true,
      is_editable: false,
      permissions: ADMIN_PAGE_REGISTRY.map((page) => ({
        page_key: page.key,
        can_access: true,
        default_label: page.defaultLabel,
        label_key: page.labelKey,
        group_key: page.groupKey,
        group_label_key: page.groupLabelKey,
        route: page.route,
        is_root_locked: page.isRootLocked,
      })),
    };
  }

  const storedMap = new Map();
  if (Array.isArray(storedRows)) {
    for (const row of storedRows) {
      if (row && isValidPageKey(row.page_key)) {
        storedMap.set(row.page_key, Boolean(row.can_access));
      }
    }
  }

  return {
    role_id: role.role_id.toString(),
    role_english: role.role_english,
    is_admin_root: false,
    is_editable: true,
    permissions: ADMIN_PAGE_REGISTRY.map((page) => ({
      page_key: page.key,
      can_access: storedMap.get(page.key) ?? false,
      default_label: page.defaultLabel,
      label_key: page.labelKey,
      group_key: page.groupKey,
      group_label_key: page.groupLabelKey,
      route: page.route,
      is_root_locked: page.isRootLocked,
    })),
  };
};

module.exports = {
  isValidPageKey,
  normalizeActiveRoles,
  hasRootAdminRole,
  resolvePageAccess,
  resolveSupportReadAccess,
  resolveEffectivePermissions,
  buildRolePermissionMatrix,
};

