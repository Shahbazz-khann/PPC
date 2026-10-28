const { pool } = require('../../../../config/db');

/**
 * Retrieves Property Use reference data.
 * Provides parameterized search and filtering, with BigInt safety.
 */
const getAdminPropertyUses = async ({ search, status, page = 1, limit = 10 } = {}) => {
  try {
    let baseQuery = `
      FROM property_use p
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      baseQuery += ` AND (p.property_use_description ILIKE $${paramIndex} OR p.property_use_urdu ILIKE $${paramIndex} OR p.property_use_abb ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Status filter
    if (status && status !== 'all') {
      baseQuery += ` AND p.is_active = $${paramIndex}`;
      params.push(status === 'active');
      paramIndex++;
    }

    // Get total count before applying limit/offset
    const countQuery = `SELECT COUNT(*) FROM (SELECT 1 ${baseQuery}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Default Ordering: description ASC, ID ASC
    baseQuery += ` ORDER BY p.property_use_description ASC, p.property_use_id ASC`;

    // Pagination
    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const fullQuery = `
      SELECT 
        p.property_use_id,
        p.property_use_description,
        p.property_use_urdu,
        p.property_use_abb,
        p.is_active
      ${baseQuery}
    `;

    const { rows } = await pool.query(fullQuery, params);

    return {
      rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

const findPropertyUseByDescriptionInsensitive = async (propertyUseDescription) => {
  const query = `
    SELECT 
      property_use_id,
      property_use_description,
      property_use_urdu,
      property_use_abb,
      is_active
    FROM property_use
    WHERE LOWER(property_use_description) = LOWER($1)
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [propertyUseDescription]);
  return rows[0] || null;
};

const createAdminPropertyUse = async ({ property_use_description, property_use_urdu, property_use_abb }) => {
  const urdu = (property_use_urdu === undefined || property_use_urdu === null || String(property_use_urdu).trim() === '') ? null : property_use_urdu;
  const abb = (property_use_abb === undefined || property_use_abb === null || String(property_use_abb).trim() === '') ? null : property_use_abb;

  const query = `
    INSERT INTO property_use (
      property_use_description,
      property_use_urdu,
      property_use_abb
    )
    VALUES ($1, $2, $3)
    RETURNING 
      property_use_id,
      property_use_description,
      property_use_urdu,
      property_use_abb,
      is_active
  `;

  const { rows } = await pool.query(query, [property_use_description, urdu, abb]);
  return rows[0];
};

const getAdminPropertyUseById = async (propertyUseId) => {
  const query = `
    SELECT 
      property_use_id,
      property_use_description,
      property_use_urdu,
      property_use_abb,
      is_active
    FROM property_use
    WHERE property_use_id = $1
  `;
  const { rows } = await pool.query(query, [propertyUseId]);
  return rows[0] || null;
};

const findPropertyUseByDescriptionInsensitiveExcludingId = async (description, propertyUseId) => {
  const query = `
    SELECT 
      property_use_id,
      property_use_description,
      property_use_urdu,
      property_use_abb,
      is_active
    FROM property_use
    WHERE LOWER(property_use_description) = LOWER($1)
      AND property_use_id <> $2
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [description, propertyUseId]);
  return rows[0] || null;
};

const updateAdminPropertyUse = async (propertyUseId, { property_use_description, property_use_urdu, property_use_abb, is_active }) => {
  const urdu = (property_use_urdu === undefined || property_use_urdu === null || String(property_use_urdu).trim() === '') ? null : property_use_urdu;
  const abb = (property_use_abb === undefined || property_use_abb === null || String(property_use_abb).trim() === '') ? null : property_use_abb;

  const query = `
    UPDATE property_use
    SET 
      property_use_description = $1,
      property_use_urdu = $2,
      property_use_abb = $3,
      is_active = $4
    WHERE property_use_id = $5
    RETURNING 
      property_use_id,
      property_use_description,
      property_use_urdu,
      property_use_abb,
      is_active
  `;

  const { rows } = await pool.query(query, [property_use_description, urdu, abb, is_active, propertyUseId]);
  return rows[0] || null;
};

const getPropertyUseDependencies = async (propertyUseId) => {
  const query = `
    SELECT COUNT(*)::int AS count
    FROM properties
    WHERE property_use_id = $1
  `;
  const { rows } = await pool.query(query, [propertyUseId]);
  const count = rows[0].count;
  
  if (count > 0) {
    return {
      hasDependencies: true,
      dependencies: [
        {
          table: 'properties',
          count: count
        }
      ]
    };
  }
  
  return {
    hasDependencies: false,
    dependencies: []
  };
};

const deleteAdminPropertyUse = async (propertyUseId) => {
  const query = `
    DELETE FROM property_use
    WHERE property_use_id = $1
    RETURNING 
      property_use_id,
      property_use_description,
      property_use_urdu,
      property_use_abb,
      is_active
  `;
  const { rows } = await pool.query(query, [propertyUseId]);
  return rows[0] || null;
};

module.exports = {
  getAdminPropertyUses,
  findPropertyUseByDescriptionInsensitive,
  createAdminPropertyUse,
  getAdminPropertyUseById,
  findPropertyUseByDescriptionInsensitiveExcludingId,
  updateAdminPropertyUse,
  getPropertyUseDependencies,
  deleteAdminPropertyUse
};
