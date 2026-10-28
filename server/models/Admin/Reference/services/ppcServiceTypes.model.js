const { pool } = require('../../../../config/db');

/**
 * Retrieves PPC Service Types reference data with search, status filtering, and pagination.
 */
const getAdminPpcServiceTypes = async ({ search, status, page = 1, limit = 10 } = {}) => {
  try {
    let baseQuery = `
      FROM ppc_service_types st
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Search filter across English, Urdu, and Abbreviation
    if (search && typeof search === 'string' && search.trim() !== '') {
      baseQuery += ` AND (
        st.service_type_english ILIKE $${paramIndex} 
        OR st.service_type_urdu ILIKE $${paramIndex} 
        OR st.service_type_abb ILIKE $${paramIndex}
      )`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Status filter
    if (status && status !== 'all') {
      baseQuery += ` AND st.is_active = $${paramIndex}`;
      params.push(status === 'active');
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (SELECT 1 ${baseQuery}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Default Ordering
    baseQuery += ` ORDER BY st.service_type_english ASC, st.service_type_id ASC`;

    // Pagination
    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const fullQuery = `
      SELECT 
        st.service_type_id,
        st.service_type_english,
        st.service_type_urdu,
        st.service_type_abb,
        st.is_active
      ${baseQuery}
    `;

    const { rows } = await pool.query(fullQuery, params);

    return {
      rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a single PPC service type by ID.
 */
const getAdminPpcServiceTypeById = async (serviceTypeId) => {
  try {
    const query = `
      SELECT 
        service_type_id,
        service_type_english,
        service_type_urdu,
        service_type_abb,
        is_active
      FROM ppc_service_types
      WHERE service_type_id = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [serviceTypeId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a service type by case-insensitive English name.
 */
const findPpcServiceTypeByEnglishInsensitive = async (englishName) => {
  try {
    const query = `
      SELECT 
        service_type_id,
        service_type_english,
        is_active
      FROM ppc_service_types
      WHERE LOWER(service_type_english) = LOWER($1)
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [englishName.trim()]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a service type by case-insensitive English name excluding a specific ID (for self-edit).
 */
const findPpcServiceTypeByEnglishInsensitiveExcludingId = async (englishName, serviceTypeId) => {
  try {
    const query = `
      SELECT 
        service_type_id,
        service_type_english,
        is_active
      FROM ppc_service_types
      WHERE LOWER(service_type_english) = LOWER($1)
      AND service_type_id <> $2
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [englishName.trim(), serviceTypeId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Creates a new PPC service type.
 */
const createAdminPpcServiceType = async ({
  service_type_english,
  service_type_urdu,
  service_type_abb
}) => {
  try {
    const query = `
      INSERT INTO ppc_service_types (
        service_type_english,
        service_type_urdu,
        service_type_abb
      )
      VALUES ($1, $2, $3)
      RETURNING
        service_type_id,
        service_type_english,
        service_type_urdu,
        service_type_abb,
        is_active
    `;

    const urdu = service_type_urdu?.trim() ? service_type_urdu.trim() : null;
    const abb = service_type_abb?.trim() ? service_type_abb.trim().toUpperCase() : null;

    const values = [service_type_english.trim(), urdu, abb];
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Updates an existing PPC service type.
 */
const updateAdminPpcServiceType = async (serviceTypeId, {
  service_type_english,
  service_type_urdu,
  service_type_abb,
  is_active
}) => {
  try {
    const query = `
      UPDATE ppc_service_types
      SET 
        service_type_english = $1,
        service_type_urdu = $2,
        service_type_abb = $3,
        is_active = $4
      WHERE service_type_id = $5
      RETURNING 
        service_type_id,
        service_type_english,
        service_type_urdu,
        service_type_abb,
        is_active
    `;

    const urdu = service_type_urdu?.trim() ? service_type_urdu.trim() : null;
    const abb = service_type_abb?.trim() ? service_type_abb.trim().toUpperCase() : null;

    const values = [
      service_type_english.trim(),
      urdu,
      abb,
      is_active,
      serviceTypeId
    ];

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Checks if a service type is referenced in child tables (e.g. ppc_services).
 */
const getPpcServiceTypeDependencies = async (serviceTypeId) => {
  try {
    const res = await pool.query(
      `SELECT COUNT(*)::int AS count FROM ppc_services WHERE service_type_id = $1`,
      [serviceTypeId]
    );
    const serviceCount = res.rows[0].count;

    const dependencies = [];
    if (serviceCount > 0) {
      dependencies.push({ table: 'ppc_services', count: serviceCount });
    }

    return {
      hasDependencies: dependencies.length > 0,
      dependencies
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a PPC service type.
 */
const deleteAdminPpcServiceType = async (serviceTypeId) => {
  try {
    const query = `
      DELETE FROM ppc_service_types
      WHERE service_type_id = $1
      RETURNING service_type_id, service_type_english
    `;
    const { rows } = await pool.query(query, [serviceTypeId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAdminPpcServiceTypes,
  getAdminPpcServiceTypeById,
  findPpcServiceTypeByEnglishInsensitive,
  findPpcServiceTypeByEnglishInsensitiveExcludingId,
  createAdminPpcServiceType,
  updateAdminPpcServiceType,
  getPpcServiceTypeDependencies,
  deleteAdminPpcServiceType
};
