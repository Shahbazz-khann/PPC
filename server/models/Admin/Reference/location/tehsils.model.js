const { pool } = require('../../../../config/db');

/**
 * Retrieves Tehsils reference data joined with District, Division, Province and Country.
 * Provides parameterized search and filtering, with BigInt safety.
 */
const getAdminTehsils = async ({ search, status, countryId, provinceId, divisionId, districtId, page = 1, limit = 10 } = {}) => {
  try {
    let baseQuery = `
      FROM tehsils t
      JOIN districts d ON d.district_id = t.district_id
      JOIN divisions div ON div.division_id = d.division_id
      JOIN provinces p ON p.province_id = div.province_id
      JOIN countries c ON c.country_id = p.country_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Search filter: only applies to tehsil fields
    if (search && search.trim() !== '') {
      baseQuery += ` AND (t.tehsil_english ILIKE $${paramIndex} OR t.tehsil_urdu ILIKE $${paramIndex} OR t.tehsil_abb ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Status filter
    if (status && status !== 'all') {
      baseQuery += ` AND t.is_active = $${paramIndex}`;
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
      baseQuery += ` AND div.division_id = $${paramIndex}`;
      params.push(divisionId);
      paramIndex++;
    }

    // District filter
    if (districtId) {
      baseQuery += ` AND t.district_id = $${paramIndex}`;
      params.push(districtId);
      paramIndex++;
    }

    // Get total count before applying limit/offset
    const countQuery = `SELECT COUNT(*) FROM (SELECT 1 ${baseQuery}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Default Ordering: Hierarchy + deterministic ID tie-breaker
    baseQuery += ` ORDER BY c.country_english ASC, p.province_english ASC, div.division_english ASC, d.district_english ASC, t.tehsil_english ASC, t.tehsil_id ASC`;

    // Pagination
    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const fullQuery = `
      SELECT 
        t.tehsil_id,
        t.tehsil_english,
        t.tehsil_urdu,
        t.tehsil_abb,
        t.is_active,
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
 * Creates a new Tehsil.
 */
const createAdminTehsil = async ({ district_id, tehsil_english, tehsil_urdu, tehsil_abb }) => {
  try {
    const query = `
      INSERT INTO tehsils (
        district_id,
        tehsil_english,
        tehsil_urdu,
        tehsil_abb
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        tehsil_id,
        district_id,
        tehsil_english,
        tehsil_urdu,
        tehsil_abb,
        is_active
    `;
    // Ensure raw SQL NULL for optional fields if not provided or empty strings
    const urduVal = tehsil_urdu ? tehsil_urdu : null;
    const abbVal = tehsil_abb ? tehsil_abb : null;
    
    const { rows } = await pool.query(query, [district_id, tehsil_english, urduVal, abbVal]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a Tehsil case-insensitively by English name within the same District.
 * Used for duplicate prevention.
 * Note: Does not filter by is_active, so inactive records still trigger duplicates.
 */
const findTehsilByEnglishInsensitiveInDistrict = async (districtId, tehsilEnglish) => {
  try {
    const query = `
      SELECT *
      FROM tehsils
      WHERE district_id = $1
        AND LOWER(tehsil_english) = LOWER($2)
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [districtId, tehsilEnglish]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};


/**
 * Retrieves a single Tehsil by ID.
 * Returns exactly 6 fields: tehsil_id, district_id, tehsil_english,
 * tehsil_urdu, tehsil_abb, is_active.
 * Country / Province / Division are UI-only and NOT stored in tehsils.
 * Returns null if not found.
 */
const getAdminTehsilById = async (tehsilId) => {
  try {
    const query = `
      SELECT
        tehsil_id,
        district_id,
        tehsil_english,
        tehsil_urdu,
        tehsil_abb,
        is_active
      FROM tehsils
      WHERE tehsil_id = $1
    `;
    const { rows } = await pool.query(query, [tehsilId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a Tehsil case-insensitively by English name within the same District,
 * excluding the specified Tehsil ID.
 * Used for duplicate prevention during Edit.
 *
 * Scope: district_id only (same name under a different District is allowed).
 * No is_active filter — inactive rows still count as conflicts.
 * The current row is excluded so a case-only self-edit does not self-conflict.
 * If district_id changes, $1 must be the NEW district_id — scope follows the
 * target District, not the original one.
 */
const findTehsilByEnglishInsensitiveInDistrictExcludingId = async (districtId, tehsilEnglish, tehsilId) => {
  try {
    const query = `
      SELECT *
      FROM tehsils
      WHERE district_id = $1
        AND LOWER(tehsil_english) = LOWER($2)
        AND tehsil_id <> $3
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [districtId, tehsilEnglish, tehsilId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates an existing Tehsil.
 * tehsil_id is immutable — used only in WHERE, never SET.
 * Country / Province / Division are UI-only and NOT persisted here.
 * Only district_id is the persisted parent FK.
 * tehsil_urdu and tehsil_abb are optional: empty-string coerced to null.
 * is_active accepts actual boolean (no HTTP/string coercion in model layer).
 * Invalid district_id produces 23503 (FK violation) — bubbles raw.
 * DB unique constraint uq_tehsil_district may produce 23505 — bubbles raw.
 * Returns null if tehsil_id not found (0 rows updated).
 */
const updateAdminTehsil = async (tehsilId, { district_id, tehsil_english, tehsil_urdu, tehsil_abb, is_active }) => {
  try {
    const query = `
      UPDATE tehsils
      SET
        district_id    = $1,
        tehsil_english = $2,
        tehsil_urdu    = $3,
        tehsil_abb     = $4,
        is_active      = $5
      WHERE tehsil_id = $6
      RETURNING
        tehsil_id,
        district_id,
        tehsil_english,
        tehsil_urdu,
        tehsil_abb,
        is_active
    `;
    const urduVal = tehsil_urdu ? tehsil_urdu : null;
    const abbVal  = tehsil_abb  ? tehsil_abb  : null;

    const { rows } = await pool.query(query, [
      district_id,
      tehsil_english,
      urduVal,
      abbVal,
      is_active,
      tehsilId
    ]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Checks if a Tehsil has dependent records in other tables (cities).
 * Returns only nonzero dependencies.
 */
const getTehsilDependencies = async (tehsilId) => {
  try {
    const cityRes = await pool.query(
      `SELECT COUNT(*)::int AS count FROM cities WHERE tehsil_id = $1`,
      [tehsilId]
    );
    const cityCount = cityRes.rows[0].count;

    const dependencies = [];
    if (cityCount > 0) {
      dependencies.push({ table: 'cities', count: cityCount });
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
 * Performs a physical delete of a Tehsil.
 * Used only when the Tehsil has no dependent children.
 */
const deleteAdminTehsil = async (tehsilId) => {
  try {
    const query = `
      DELETE FROM tehsils
      WHERE tehsil_id = $1
      RETURNING
        tehsil_id,
        district_id,
        tehsil_english,
        tehsil_urdu,
        tehsil_abb,
        is_active
    `;
    const { rows } = await pool.query(query, [tehsilId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAdminTehsils,
  createAdminTehsil,
  findTehsilByEnglishInsensitiveInDistrict,
  getAdminTehsilById,
  findTehsilByEnglishInsensitiveInDistrictExcludingId,
  updateAdminTehsil,
  getTehsilDependencies,
  deleteAdminTehsil
};

