const { pool } = require('../../config/db');

/**
 * @file rolePageAccess.model.js
 * @description Data-layer model for reading role_page_access permissions and live role state.
 * Strictly adheres to:
 * - Parameterized PostgreSQL queries only (no string interpolation).
 * - BIGINT IDs handled as strings throughout (casting with ::text).
 * - Read-only queries for permission resolution (no mutations).
 */

/**
 * Query role_page_access for specific role IDs and a single page key.
 * @param {string[]} roleIds - Array of string role IDs
 * @param {string} pageKey - Canonical page key
 * @returns {Promise<Array<{role_page_access_id: string, role_id: string, page_key: string, can_access: boolean}>>}
 */
const getRolePageAccessByRoleIds = async (roleIds, pageKey, dbClient = pool) => {
  if (!Array.isArray(roleIds) || roleIds.length === 0 || !pageKey) {
    return [];
  }

  const query = `
    SELECT 
      role_page_access_id::text AS role_page_access_id,
      role_id::text AS role_id,
      page_key,
      can_access
    FROM role_page_access
    WHERE role_id = ANY($1::bigint[])
      AND page_key = $2;
  `;

  const values = [roleIds, pageKey];
  const { rows } = await dbClient.query(query, values);
  return rows;
};

/**
 * Query all role_page_access records for given role IDs.
 * @param {string[]} roleIds - Array of string role IDs
 * @param {object} [dbClient=pool] - Optional client for transaction isolation
 * @returns {Promise<Array<{role_page_access_id: string, role_id: string, page_key: string, can_access: boolean}>>}
 */
const getAllRolePageAccessByRoleIds = async (roleIds, dbClient = pool) => {
  if (!Array.isArray(roleIds) || roleIds.length === 0) {
    return [];
  }

  const query = `
    SELECT 
      role_page_access_id::text AS role_page_access_id,
      role_id::text AS role_id,
      page_key,
      can_access
    FROM role_page_access
    WHERE role_id = ANY($1::bigint[]);
  `;

  const values = [roleIds];
  const { rows } = await dbClient.query(query, values);
  return rows;
};

/**
 * Fetch role records by IDs directly from PostgreSQL roles table.
 * Used to verify active status and role name dynamically (without hardcoded IDs).
 * @param {string[]} roleIds - Array of string role IDs
 * @param {object} [dbClient=pool] - Optional client for transaction isolation
 * @returns {Promise<Array<{role_id: string, role_english: string, is_active: boolean}>>}
 */
const getLiveRolesByIds = async (roleIds, dbClient = pool) => {
  if (!Array.isArray(roleIds) || roleIds.length === 0) {
    return [];
  }

  const query = `
    SELECT 
      role_id::text AS role_id,
      role_english,
      role_urdu,
      role_abb,
      is_active
    FROM roles
    WHERE role_id = ANY($1::bigint[])
    ORDER BY role_id ASC;
  `;

  const values = [roleIds];
  const { rows } = await dbClient.query(query, values);
  return rows;
};

/**
 * Query active roles for a user from user_role and roles tables.
 * @param {string} userId - User ID
 * @param {object} [dbClient=pool] - Optional client for transaction isolation
 * @returns {Promise<Array<{role_id: string, role_english: string, is_active: boolean}>>}
 */
const getLiveActiveRolesByUserId = async (userId, dbClient = pool) => {
  if (!userId) {
    return [];
  }

  const query = `
    SELECT 
      r.role_id::text AS role_id,
      r.role_english,
      r.is_active
    FROM user_role ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = $1::bigint
      AND ur.is_active = true
      AND r.is_active = true
      AND (ur.from_date IS NULL OR ur.from_date <= CURRENT_DATE)
      AND (ur.to_date IS NULL OR ur.to_date >= CURRENT_DATE);
  `;

  const values = [userId.toString()];
  const { rows } = await dbClient.query(query, values);
  return rows;
};

/**
 * Fetch a single role record by ID directly from PostgreSQL roles table.
 * @param {string} roleId - String BIGINT role ID
 * @param {object} [dbClient=pool] - Optional client for transaction isolation
 * @returns {Promise<{role_id: string, role_english: string, is_active: boolean}|null>}
 */
const getRoleById = async (roleId, dbClient = pool) => {
  if (!roleId) {
    return null;
  }
  const rows = await getLiveRolesByIds([roleId.toString()], dbClient);
  return rows[0] || null;
};

/**
 * Atomically upsert role page access records for a role.
 * Executes on an acquired dbClient within an active transaction.
 *
 * Conflict handling:
 * - Unique constraint: uq_role_page_access_role_page (role_id, page_key)
 * - Updates can_access, update_date_time, and created_by_user
 * - Preserves original creation_date_time
 *
 * @param {string} roleId - String BIGINT role ID
 * @param {Array<{page_key: string, can_access: boolean}>} permissions - Validated decisions
 * @param {string} createdByUserId - String BIGINT of actor
 * @param {object} dbClient - Acquired pg pool client
 * @returns {Promise<number>} - Count of upserted records
 */
const upsertRolePageAccess = async (roleId, permissions, createdByUserId, dbClient) => {
  if (!dbClient || typeof dbClient.query !== 'function') {
    throw new Error('upsertRolePageAccess requires an active database client');
  }

  if (!Array.isArray(permissions) || permissions.length === 0) {
    return 0;
  }

  const upsertQuery = `
    INSERT INTO role_page_access (
      role_id,
      page_key,
      can_access,
      creation_date_time,
      update_date_time,
      created_by_user
    )
    VALUES ($1::bigint, $2, $3::boolean, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $4::bigint)
    ON CONFLICT (role_id, page_key)
    DO UPDATE SET
      can_access = EXCLUDED.can_access,
      update_date_time = CURRENT_TIMESTAMP,
      created_by_user = EXCLUDED.created_by_user;
  `;

  for (const item of permissions) {
    await dbClient.query(upsertQuery, [
      roleId.toString(),
      item.page_key,
      item.can_access,
      createdByUserId ? createdByUserId.toString() : null,
    ]);
  }

  return permissions.length;
};

module.exports = {
  getRolePageAccessByRoleIds,
  getAllRolePageAccessByRoleIds,
  getLiveRolesByIds,
  getLiveActiveRolesByUserId,
  getRoleById,
  upsertRolePageAccess,
};

