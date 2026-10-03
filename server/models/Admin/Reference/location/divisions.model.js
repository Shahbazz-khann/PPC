const { pool } = require('../../../../config/db');

/**
 * Retrieves Divisions reference data joined with Province and Country.
 * Provides parameterized search and filtering, with BigInt safety.
 */
const getAdminDivisions = async ({ search, status, countryId, provinceId, page = 1, limit = 10 } = {}) => {
  try {
    let baseQuery = `
      FROM divisions d
      JOIN provinces p ON d.province_id = p.province_id
      JOIN countries c ON p.country_id = c.country_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Search filter: only applies to division fields
    if (search) {
      baseQuery += ` AND (d.division_english ILIKE $${paramIndex} OR d.division_urdu ILIKE $${paramIndex} OR d.division_abb ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Status filter
    if (status && status !== 'all') {
      baseQuery += ` AND d.is_active = $${paramIndex}`;
      params.push(status === 'active');
      paramIndex++;
    }

    // Country filter
    if (countryId) {
      baseQuery += ` AND c.country_id = $${paramIndex}`;
      params.push(countryId);
      paramIndex++;
    }

    // Province filter
    if (provinceId) {
      baseQuery += ` AND d.province_id = $${paramIndex}`;
      params.push(provinceId);
      paramIndex++;
    }

    // Get total count before applying limit/offset
    const countQuery = `SELECT COUNT(*) FROM (SELECT 1 ${baseQuery}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Default Ordering: Hierarchy
    baseQuery += ` ORDER BY c.country_english ASC, p.province_english ASC, d.division_english ASC`;

    // Pagination
    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const fullQuery = `
      SELECT 
        d.division_id,
        d.division_english,
        d.division_urdu,
        d.division_abb,
        d.is_active,
        d.province_id,
        p.province_english,
        c.country_id,
        c.country_english
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

/**
 * Creates a new Division.
 */
const createAdminDivision = async ({ province_id, division_english, division_urdu, division_abb }) => {
  try {
    const query = `
      INSERT INTO divisions (
        province_id,
        division_english,
        division_urdu,
        division_abb
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        division_id,
        province_id,
        division_english,
        division_urdu,
        division_abb,
        is_active
    `;
    // Ensure raw SQL NULL for optional fields if not provided or empty strings
    const urduVal = division_urdu ? division_urdu : null;
    const abbVal = division_abb ? division_abb : null;
    
    const { rows } = await pool.query(query, [province_id, division_english, urduVal, abbVal]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a Division case-insensitively by English name within the same Province.
 * Used for duplicate prevention.
 * Note: Does not filter by is_active, so inactive records still trigger duplicates.
 */
const findDivisionByEnglishInsensitiveInProvince = async (provinceId, divisionEnglish) => {
  try {
    const query = `
      SELECT *
      FROM divisions
      WHERE province_id = $1
        AND LOWER(division_english) = LOWER($2)
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [provinceId, divisionEnglish]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a single Division by ID.
 * Returns only the division table fields.
 */
const getAdminDivisionById = async (divisionId) => {
  try {
    const query = `
      SELECT 
        division_id,
        province_id,
        division_english,
        division_urdu,
        division_abb,
        is_active
      FROM divisions
      WHERE division_id = $1
    `;
    const { rows } = await pool.query(query, [divisionId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a Division case-insensitively by English name within the same Province,
 * excluding the specified Division ID.
 * Used for duplicate prevention during edit.
 * Note: Does not filter by is_active, so inactive records still trigger duplicates.
 */
const findDivisionByEnglishInsensitiveInProvinceExcludingId = async (provinceId, divisionEnglish, divisionId) => {
  try {
    const query = `
      SELECT *
      FROM divisions
      WHERE province_id = $1
        AND LOWER(division_english) = LOWER($2)
        AND division_id <> $3
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [provinceId, divisionEnglish, divisionId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates an existing Division.
 * Primary key division_id is excluded from SET.
 * Optional fields correctly set to NULL.
 */
const updateAdminDivision = async (divisionId, { province_id, division_english, division_urdu, division_abb, is_active }) => {
  try {
    const query = `
      UPDATE divisions
      SET 
        province_id = $1,
        division_english = $2,
        division_urdu = $3,
        division_abb = $4,
        is_active = $5
      WHERE division_id = $6
      RETURNING
        division_id,
        province_id,
        division_english,
        division_urdu,
        division_abb,
        is_active
    `;
    const urduVal = division_urdu ? division_urdu : null;
    const abbVal = division_abb ? division_abb : null;
    
    const { rows } = await pool.query(query, [province_id, division_english, urduVal, abbVal, is_active, divisionId]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Checks if a Division has dependent records in other tables.
 * Returns only non-zero dependencies.
 * 
 * @param {string} divisionId 
 * @returns {Promise<Object>}
 */
const getDivisionDependencies = async (divisionId) => {
  try {
    const query = `SELECT COUNT(*)::int AS count FROM districts WHERE division_id = $1`;
    const { rows } = await pool.query(query, [divisionId]);
    const distCount = rows[0].count;

    const dependencies = [];
    if (distCount > 0) {
      dependencies.push({ table: 'districts', count: distCount });
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
 * Physically deletes a Division from the database.
 * Does not check dependencies internally; relies on PostgreSQL 23503 error for safety
 * if dependent records exist.
 * 
 * @param {string} divisionId 
 * @returns {Promise<Object|null>} The deleted row or null if not found
 */
const deleteAdminDivision = async (divisionId) => {
  try {
    const query = `
      DELETE FROM divisions
      WHERE division_id = $1
      RETURNING
        division_id,
        province_id,
        division_english,
        division_urdu,
        division_abb,
        is_active
    `;
    const { rows } = await pool.query(query, [divisionId]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAdminDivisions,
  createAdminDivision,
  findDivisionByEnglishInsensitiveInProvince,
  getAdminDivisionById,
  findDivisionByEnglishInsensitiveInProvinceExcludingId,
  updateAdminDivision,
  getDivisionDependencies,
  deleteAdminDivision
};
