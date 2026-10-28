const { pool } = require('../../../../config/db');

/**
 * Retrieves Districts reference data joined with Division, Province and Country.
 * Provides parameterized search and filtering, with BigInt safety.
 */
const getAdminDistricts = async ({ search, status, countryId, provinceId, divisionId, page = 1, limit = 10 } = {}) => {
  try {
    let baseQuery = `
      FROM districts d
      JOIN divisions dv ON dv.division_id = d.division_id
      JOIN provinces p ON p.province_id = dv.province_id
      JOIN countries c ON c.country_id = p.country_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Search filter: only applies to district fields
    if (search) {
      baseQuery += ` AND (d.district_english ILIKE $${paramIndex} OR d.district_urdu ILIKE $${paramIndex} OR d.district_abb ILIKE $${paramIndex})`;
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
      baseQuery += ` AND p.province_id = $${paramIndex}`;
      params.push(provinceId);
      paramIndex++;
    }

    // Division filter
    if (divisionId) {
      baseQuery += ` AND d.division_id = $${paramIndex}`;
      params.push(divisionId);
      paramIndex++;
    }

    // Get total count before applying limit/offset
    const countQuery = `SELECT COUNT(*) FROM (SELECT 1 ${baseQuery}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Default Ordering: Hierarchy + deterministic ID tie-breaker
    baseQuery += ` ORDER BY c.country_english ASC, p.province_english ASC, dv.division_english ASC, d.district_english ASC, d.district_id ASC`;

    // Pagination
    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const fullQuery = `
      SELECT 
        d.district_id,
        d.district_english,
        d.district_urdu,
        d.district_abb,
        d.is_active,
        d.division_id,
        dv.division_english,
        dv.province_id,
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
 * Creates a new District.
 */
const createAdminDistrict = async ({ division_id, district_english, district_urdu, district_abb }) => {
  try {
    const query = `
      INSERT INTO districts (
        division_id,
        district_english,
        district_urdu,
        district_abb
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        district_id,
        division_id,
        district_english,
        district_urdu,
        district_abb,
        is_active
    `;
    // Ensure raw SQL NULL for optional fields if not provided or empty strings
    const urduVal = district_urdu ? district_urdu : null;
    const abbVal = district_abb ? district_abb : null;
    
    const { rows } = await pool.query(query, [division_id, district_english, urduVal, abbVal]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a District case-insensitively by English name within the same Division.
 * Used for duplicate prevention.
 * Note: Does not filter by is_active, so inactive records still trigger duplicates.
 */
const findDistrictByEnglishInsensitiveInDivision = async (divisionId, districtEnglish) => {
  try {
    const query = `
      SELECT *
      FROM districts
      WHERE division_id = $1
        AND LOWER(district_english) = LOWER($2)
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [divisionId, districtEnglish]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a District by ID.
 * Returns exact 6 fields.
 */
const getAdminDistrictById = async (districtId) => {
  try {
    const query = `
      SELECT 
        district_id,
        division_id,
        district_english,
        district_urdu,
        district_abb,
        is_active
      FROM districts
      WHERE district_id = $1
    `;
    const { rows } = await pool.query(query, [districtId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a District case-insensitively by English name within the same Division,
 * excluding the specified District ID.
 * Used for duplicate prevention during Edit.
 */
const findDistrictByEnglishInsensitiveInDivisionExcludingId = async (divisionId, districtEnglish, districtId) => {
  try {
    const query = `
      SELECT *
      FROM districts
      WHERE division_id = $1
        AND LOWER(district_english) = LOWER($2)
        AND district_id <> $3
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [divisionId, districtEnglish, districtId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates an existing District.
 * district_id is immutable.
 */
const updateAdminDistrict = async (districtId, { division_id, district_english, district_urdu, district_abb, is_active }) => {
  try {
    const query = `
      UPDATE districts
      SET
        division_id = $1,
        district_english = $2,
        district_urdu = $3,
        district_abb = $4,
        is_active = $5
      WHERE district_id = $6
      RETURNING
        district_id,
        division_id,
        district_english,
        district_urdu,
        district_abb,
        is_active
    `;
    const urduVal = district_urdu ? district_urdu : null;
    const abbVal = district_abb ? district_abb : null;

    const { rows } = await pool.query(query, [
      division_id,
      district_english,
      urduVal,
      abbVal,
      is_active,
      districtId
    ]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Checks if a District has dependent records in other tables.
 * Returns only nonzero dependencies.
 */
const getDistrictDependencies = async (districtId) => {
  try {
    const tehsilRes = await pool.query(
      `SELECT COUNT(*)::int AS count FROM tehsils WHERE district_id = $1`,
      [districtId]
    );
    const tehsilCount = tehsilRes.rows[0].count;

    const dependencies = [];
    if (tehsilCount > 0) {
      dependencies.push({ table: 'tehsils', count: tehsilCount });
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
 * Performs a physical delete of a District.
 * Used only when the District has no dependent children.
 */
const deleteAdminDistrict = async (districtId) => {
  try {
    const query = `
      DELETE FROM districts
      WHERE district_id = $1
      RETURNING
        district_id,
        division_id,
        district_english,
        district_urdu,
        district_abb,
        is_active
    `;
    const { rows } = await pool.query(query, [districtId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAdminDistricts,
  createAdminDistrict,
  findDistrictByEnglishInsensitiveInDivision,
  getAdminDistrictById,
  findDistrictByEnglishInsensitiveInDivisionExcludingId,
  updateAdminDistrict,
  getDistrictDependencies,
  deleteAdminDistrict
};
