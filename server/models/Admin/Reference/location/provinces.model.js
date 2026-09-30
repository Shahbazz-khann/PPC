const { pool } = require('../../../../config/db');

/**
 * Retrieves a list of provinces for the Admin Reference Tables.
 * Supports searching by province english, urdu, or abbreviation, and filtering by status.
 *
 * @param {Object} filters
 * @param {string} [filters.search] - Optional search string
 * @param {string} [filters.status='all'] - 'all', 'active', or 'inactive'
 * @param {string|number} [filters.countryId] - Optional country ID to filter by
 * @returns {Promise<Array>} Array of province objects
 */
const getAdminProvinces = async ({ search = '', status = 'all', countryId } = {}) => {
    let query = `
        SELECT 
            p.province_id,
            p.country_id,
            c.country_english,
            p.province_english,
            p.province_urdu,
            p.province_abb,
            p.is_active
        FROM provinces p
        JOIN countries c ON p.country_id = c.country_id
        WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search && search.trim() !== '') {
        query += ` AND (
            p.province_english ILIKE $${paramIndex} OR 
            p.province_urdu ILIKE $${paramIndex} OR 
            p.province_abb ILIKE $${paramIndex}
        )`;
        params.push(`%${search.trim()}%`);
        paramIndex++;
    }

    if (countryId) {
        query += ` AND p.country_id = $${paramIndex}`;
        params.push(countryId);
        paramIndex++;
    }

    if (status === 'active') {
        query += ` AND p.is_active = true`;
    } else if (status === 'inactive') {
        query += ` AND p.is_active = false`;
    }

    query += ` ORDER BY c.country_english ASC, p.province_english ASC`;

    const result = await pool.query(query, params);
    return result.rows;
};

/**
 * Checks if a province with the given English name already exists within a specific country (case-insensitive).
 * Justified by business rules requiring friendly validation before Postgres throws a 23505 (which is case-sensitive).
 *
 * @param {string|number} countryId
 * @param {string} provinceEnglish
 * @returns {Promise<Object|null>} The province record if found, else null
 */
const findProvinceByEnglishInsensitiveInCountry = async (countryId, provinceEnglish) => {
    const query = `
        SELECT province_id
        FROM provinces
        WHERE country_id = $1 AND province_english ILIKE $2
        LIMIT 1
    `;
    const result = await pool.query(query, [countryId, provinceEnglish.trim()]);
    return result.rows[0] || null;
};

/**
 * Creates a new province in the database.
 * Relies on DB defaults for province_id (sequence) and is_active (true).
 *
 * @param {Object} data
 * @param {string|number} data.country_id
 * @param {string} data.province_english
 * @param {string|null} data.province_urdu
 * @param {string|null} data.province_abb
 * @returns {Promise<Object>} The newly created province row
 */
const createAdminProvince = async ({ country_id, province_english, province_urdu, province_abb }) => {
    const query = `
        INSERT INTO provinces (
            country_id,
            province_english,
            province_urdu,
            province_abb
        )
        VALUES ($1, $2, $3, $4)
        RETURNING 
            province_id,
            country_id,
            province_english,
            province_urdu,
            province_abb,
            is_active
    `;
    
    const values = [
        country_id,
        province_english,
        province_urdu,
        province_abb
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * Retrieves a single province by ID.
 * @param {string|number} provinceId
 * @returns {Promise<Object|null>}
 */
const getAdminProvinceById = async (provinceId) => {
    const query = `
        SELECT 
            province_id,
            country_id,
            province_english,
            province_urdu,
            province_abb,
            is_active
        FROM provinces
        WHERE province_id = $1
    `;
    const result = await pool.query(query, [provinceId]);
    return result.rows[0] || null;
};

/**
 * Finds a province by english name inside a country, excluding a specific province ID.
 * Useful for duplicate prevention during an edit.
 * @param {string|number} countryId
 * @param {string} provinceEnglish
 * @param {string|number} provinceId
 * @returns {Promise<Object|null>}
 */
const findProvinceByEnglishInsensitiveInCountryExcludingId = async (countryId, provinceEnglish, provinceId) => {
    const query = `
        SELECT province_id
        FROM provinces
        WHERE country_id = $1 
          AND LOWER(province_english) = LOWER($2)
          AND province_id <> $3
        LIMIT 1
    `;
    const result = await pool.query(query, [countryId, provinceEnglish.trim(), provinceId]);
    return result.rows[0] || null;
};

/**
 * Updates an existing province.
 * @param {string|number} provinceId
 * @param {Object} data
 * @param {string|number} data.country_id
 * @param {string} data.province_english
 * @param {string|null} data.province_urdu
 * @param {string|null} data.province_abb
 * @param {boolean} data.is_active
 * @returns {Promise<Object>}
 */
const updateAdminProvince = async (provinceId, { country_id, province_english, province_urdu, province_abb, is_active }) => {
    const query = `
        UPDATE provinces
        SET
            country_id = $1,
            province_english = $2,
            province_urdu = $3,
            province_abb = $4,
            is_active = $5
        WHERE province_id = $6
        RETURNING
            province_id,
            country_id,
            province_english,
            province_urdu,
            province_abb,
            is_active
    `;
    const values = [
        country_id,
        province_english,
        province_urdu,
        province_abb,
        is_active,
        provinceId
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    getAdminProvinces,
    findProvinceByEnglishInsensitiveInCountry,
    createAdminProvince,
    getAdminProvinceById,
    findProvinceByEnglishInsensitiveInCountryExcludingId,
    updateAdminProvince
};
