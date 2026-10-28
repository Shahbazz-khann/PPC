const { pool } = require('../../../../config/db');

/**
 * Retrieves Cities reference data joined with Tehsil, District, Division, Province and Country.
 * Provides parameterized search and filtering, with BigInt safety.
 */
const getAdminCities = async ({ search, status, countryId, provinceId, divisionId, districtId, tehsilId, page = 1, limit = 10 } = {}) => {
  try {
    let baseQuery = `
      FROM cities ci
      JOIN tehsils t ON t.tehsil_id = ci.tehsil_id
      JOIN districts d ON d.district_id = t.district_id
      JOIN divisions div ON div.division_id = d.division_id
      JOIN provinces p ON p.province_id = div.province_id
      JOIN countries c ON c.country_id = p.country_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Search filter: only applies to city fields
    if (search && search.trim() !== '') {
      baseQuery += ` AND (ci.city_english ILIKE $${paramIndex} OR ci.city_urdu ILIKE $${paramIndex} OR ci.city_abb ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Status filter
    if (status && status !== 'all') {
      baseQuery += ` AND ci.is_active = $${paramIndex}`;
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

    // Get total count before applying limit/offset
    const countQuery = `SELECT COUNT(*) FROM (SELECT 1 ${baseQuery}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Default Ordering: Hierarchy + deterministic ID tie-breaker
    baseQuery += ` ORDER BY c.country_english ASC, p.province_english ASC, div.division_english ASC, d.district_english ASC, t.tehsil_english ASC, ci.city_english ASC, ci.city_id ASC`;

    // Pagination
    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const fullQuery = `
      SELECT 
        ci.city_id,
        ci.city_english,
        ci.city_urdu,
        ci.city_abb,
        ci.is_active,
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
 * Creates a new City.
 */
const createAdminCity = async ({ tehsil_id, city_english, city_urdu, city_abb }) => {
  const query = `
    INSERT INTO cities (
      tehsil_id,
      city_english,
      city_urdu,
      city_abb
    )
    VALUES ($1, $2, $3, $4)
    RETURNING 
      city_id,
      tehsil_id,
      city_english,
      city_urdu,
      city_abb,
      is_active
  `;

  // Apply optional null normalization convention
  const urdu = city_urdu && city_urdu.trim() !== '' ? city_urdu.trim() : null;
  const abb = city_abb && city_abb.trim() !== '' ? city_abb.trim() : null;

  const values = [tehsil_id, city_english, urdu, abb];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

/**
 * Checks for duplicate City English name within a given Tehsil.
 */
const findCityByEnglishInsensitiveInTehsil = async (tehsilId, cityEnglish) => {
  const query = `
    SELECT * FROM cities
    WHERE tehsil_id = $1
    AND LOWER(city_english) = LOWER($2)
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [tehsilId, cityEnglish]);
  return rows[0] || null;
};

/**
 * Retrieves a single City by ID.
 * Returns exactly 6 fields: city_id, tehsil_id, city_english,
 * city_urdu, city_abb, is_active.
 * Returns null if not found.
 */
const getAdminCityById = async (cityId) => {
  try {
    const query = `
      SELECT
        city_id,
        tehsil_id,
        city_english,
        city_urdu,
        city_abb,
        is_active
      FROM cities
      WHERE city_id = $1
    `;
    const { rows } = await pool.query(query, [cityId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a City case-insensitively by English name within the same Tehsil,
 * excluding the specified City ID.
 * Used for duplicate prevention during Edit.
 */
const findCityByEnglishInsensitiveInTehsilExcludingId = async (tehsilId, cityEnglish, cityId) => {
  try {
    const query = `
      SELECT *
      FROM cities
      WHERE tehsil_id = $1
        AND LOWER(city_english) = LOWER($2)
        AND city_id <> $3
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [tehsilId, cityEnglish, cityId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates an existing City.
 * city_id is immutable — used only in WHERE, never SET.
 */
const updateAdminCity = async (cityId, { tehsil_id, city_english, city_urdu, city_abb, is_active }) => {
  try {
    const query = `
      UPDATE cities
      SET
        tehsil_id    = $1,
        city_english = $2,
        city_urdu    = $3,
        city_abb     = $4,
        is_active    = $5
      WHERE city_id = $6
      RETURNING
        city_id,
        tehsil_id,
        city_english,
        city_urdu,
        city_abb,
        is_active
    `;
    const urduVal = city_urdu && city_urdu.trim() !== '' ? city_urdu.trim() : null;
    const abbVal  = city_abb && city_abb.trim() !== '' ? city_abb.trim() : null;
    
    const values = [tehsil_id, city_english, urduVal, abbVal, is_active, cityId];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Checks for live foreign-key dependencies before City deletion.
 * Only returns dependency entries with count > 0.
 */
const getCityDependencies = async (cityId) => {
  try {
    const dependencies = [];

    // 1. Check Societies
    const socQuery = `SELECT COUNT(*)::int AS count FROM societies WHERE city_id = $1`;
    const socRes = await pool.query(socQuery, [cityId]);
    const socCount = socRes.rows[0].count;
    if (socCount > 0) {
      dependencies.push({ table: 'societies', count: socCount });
    }

    // 2. Check Customer Request Property Requirements
    const crprQuery = `SELECT COUNT(*)::int AS count FROM customer_request_property_requirements WHERE city_id = $1`;
    const crprRes = await pool.query(crprQuery, [cityId]);
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
 * Physically deletes a City if it has zero dependencies.
 * Returns the deleted row if successful, or null if no row was found.
 * Any dependency violation (23503) will bubble up.
 */
const deleteAdminCity = async (cityId) => {
  try {
    const query = `
      DELETE FROM cities
      WHERE city_id = $1
      RETURNING
        city_id,
        tehsil_id,
        city_english,
        city_urdu,
        city_abb,
        is_active
    `;
    const { rows } = await pool.query(query, [cityId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAdminCities,
  createAdminCity,
  findCityByEnglishInsensitiveInTehsil,
  getAdminCityById,
  findCityByEnglishInsensitiveInTehsilExcludingId,
  updateAdminCity,
  getCityDependencies,
  deleteAdminCity
};
