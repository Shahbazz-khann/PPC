const { pool } = require('../../../../config/db');

/**
 * Retrieves Societies reference data joined with City, Tehsil, and District.
 * Provides parameterized search and filtering, with BigInt safety.
 */
const getAdminSocieties = async ({ search, status, districtId, tehsilId, cityId, page = 1, limit = 10 } = {}) => {
  try {
    let baseQuery = `
      FROM societies s
      JOIN cities ci ON s.city_id = ci.city_id
      JOIN tehsils t ON ci.tehsil_id = t.tehsil_id
      JOIN districts d ON t.district_id = d.district_id
      JOIN divisions div ON d.division_id = div.division_id
      JOIN provinces p ON div.province_id = p.province_id
      JOIN countries c ON p.country_id = c.country_id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Search filter: only applies to society fields
    if (search && search.trim() !== '') {
      baseQuery += ` AND (s.society_english ILIKE $${paramIndex} OR s.society_urdu ILIKE $${paramIndex} OR s.society_abb ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Status filter
    if (status && status !== 'all') {
      baseQuery += ` AND s.is_active = $${paramIndex}`;
      params.push(status === 'active');
      paramIndex++;
    }

    // District filter
    if (districtId) {
      baseQuery += ` AND d.district_id = $${paramIndex}`;
      params.push(districtId);
      paramIndex++;
    }

    // Tehsil filter
    if (tehsilId) {
      baseQuery += ` AND ci.tehsil_id = $${paramIndex}`;
      params.push(tehsilId);
      paramIndex++;
    }

    // City filter
    if (cityId) {
      baseQuery += ` AND s.city_id = $${paramIndex}`;
      params.push(cityId);
      paramIndex++;
    }

    // Get total count before applying limit/offset
    const countQuery = `SELECT COUNT(*) FROM (SELECT 1 ${baseQuery}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Default Ordering: Compact Hierarchy + deterministic ID tie-breaker
    baseQuery += ` ORDER BY d.district_english ASC, t.tehsil_english ASC, ci.city_english ASC, s.society_english ASC, s.society_id ASC`;

    // Pagination
    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const fullQuery = `
      SELECT 
        s.society_id,
        s.society_english,
        s.society_urdu,
        s.society_abb,
        s.is_active,
        s.city_id,
        ci.city_english,
        ci.tehsil_id,
        t.tehsil_english,
        t.district_id,
        d.district_english,
        d.division_id,
        div.division_english,
        div.province_id,
        p.province_english,
        p.country_id,
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
 * Creates a new Society.
 */
const createAdminSociety = async ({ city_id, society_english, society_urdu, society_abb }) => {
  try {
    const query = `
      INSERT INTO societies (
        city_id,
        society_english,
        society_urdu,
        society_abb
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        society_id,
        city_id,
        society_english,
        society_urdu,
        society_abb,
        is_active
    `;
    
    // Ensure raw SQL NULL for optional fields if not provided or empty strings
    const urduVal = society_urdu ? society_urdu : null;
    const abbVal = society_abb ? society_abb : null;
    
    const { rows } = await pool.query(query, [city_id, society_english, urduVal, abbVal]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a Society case-insensitively by English name within the same City.
 * Used for duplicate prevention.
 * Note: Does not filter by is_active, so inactive records still trigger duplicates.
 */
const findSocietyByEnglishInsensitiveInCity = async (cityId, societyEnglish) => {
  try {
    const query = `
      SELECT *
      FROM societies
      WHERE city_id = $1
        AND LOWER(society_english) = LOWER($2)
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [cityId, societyEnglish]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a Society case-insensitively by English name within the same City, excluding a specific ID.
 * Used for duplicate prevention during Edit.
 */
const findSocietyByEnglishInsensitiveInCityExcludingId = async (cityId, societyEnglish, societyId) => {
  try {
    const query = `
      SELECT *
      FROM societies
      WHERE city_id = $1
        AND LOWER(society_english) = LOWER($2)
        AND society_id != $3
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [cityId, societyEnglish, societyId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a single Society by ID for Editing.
 */
const getAdminSocietyById = async (societyId) => {
  try {
    const query = `
      SELECT 
        society_id,
        city_id,
        society_english,
        society_urdu,
        society_abb,
        is_active
      FROM societies
      WHERE society_id = $1
    `;
    const { rows } = await pool.query(query, [societyId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates an existing Society.
 */
const updateAdminSociety = async (societyId, { city_id, society_english, society_urdu, society_abb, is_active }) => {
  try {
    const query = `
      UPDATE societies
      SET 
        city_id = $1,
        society_english = $2,
        society_urdu = $3,
        society_abb = $4,
        is_active = $5
      WHERE society_id = $6
      RETURNING 
        society_id,
        city_id,
        society_english,
        society_urdu,
        society_abb,
        is_active
    `;
    
    const urduVal = society_urdu ? society_urdu : null;
    const abbVal = society_abb ? society_abb : null;

    const { rows } = await pool.query(query, [city_id, society_english, urduVal, abbVal, is_active, societyId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Checks for live foreign-key dependencies before Society deletion.
 * Only returns dependency entries with count > 0.
 */
const getSocietyDependencies = async (societyId) => {
  try {
    const dependencies = [];

    // 1. Check areas
    const areasQuery = `SELECT COUNT(*)::int AS count FROM areas WHERE society_id = $1`;
    const areasRes = await pool.query(areasQuery, [societyId]);
    const areasCount = areasRes.rows[0].count;
    if (areasCount > 0) {
      dependencies.push({ table: 'areas', count: areasCount });
    }

    // 2. Check customer_request_property_requirements
    const crprQuery = `SELECT COUNT(*)::int AS count FROM customer_request_property_requirements WHERE society_id = $1`;
    const crprRes = await pool.query(crprQuery, [societyId]);
    const crprCount = crprRes.rows[0].count;
    if (crprCount > 0) {
      dependencies.push({ table: 'customer_request_property_requirements', count: crprCount });
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
 * Physically deletes a Society if it has zero dependencies.
 * Returns the deleted row if successful, or null if no row was found.
 * Any dependency violation (23503) will bubble up.
 */
const deleteAdminSociety = async (societyId) => {
  try {
    const query = `
      DELETE FROM societies
      WHERE society_id = $1
      RETURNING 
        society_id,
        city_id,
        society_english,
        society_urdu,
        society_abb,
        is_active
    `;
    const { rows } = await pool.query(query, [societyId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAdminSocieties,
  createAdminSociety,
  findSocietyByEnglishInsensitiveInCity,
  findSocietyByEnglishInsensitiveInCityExcludingId,
  getAdminSocietyById,
  updateAdminSociety,
  getSocietyDependencies,
  deleteAdminSociety
};
