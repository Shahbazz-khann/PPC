const { pool } = require('../../../../config/db');

/**
 * Retrieves countries for the Admin Reference Table.
 * Includes active and inactive records by default.
 * 
 * @param {Object} options 
 * @param {string} [options.search] - Optional search text to filter by english, urdu, or abb.
 * @param {string} [options.status] - Optional status filter: 'active', 'inactive', 'all'.
 * @returns {Promise<Array>} List of plain country row objects.
 */
const getAdminCountries = async (options = {}) => {
    const { search, status } = options;
    
    let query = `
        SELECT country_id, country_english, country_urdu, country_abb, is_active
        FROM countries
        WHERE 1=1
    `;
    const params = [];
    
    // Status filter - Safe programmatic branching
    if (status === 'active') {
        query += ` AND is_active = true`;
    } else if (status === 'inactive') {
        query += ` AND is_active = false`;
    }
    // If status is 'all' or undefined/null, do not filter by is_active

    // Search filter - Parameterized safely
    if (search && typeof search === 'string' && search.trim() !== '') {
        const searchIndex = params.length + 1;
        query += ` AND (
            country_english ILIKE $${searchIndex} 
            OR country_urdu ILIKE $${searchIndex}
            OR country_abb ILIKE $${searchIndex}
        )`;
        params.push(`%${search.trim()}%`);
    }

    // Deterministic ordering by English name
    query += ` ORDER BY country_english ASC`;

    const result = await pool.query(query, params);
    
    // Return plain row objects, leaving BIGINT as raw string if that's what node-pg returns
    return result.rows;
};

/**
 * Creates a new country in the database.
 * 
 * @param {Object} data 
 * @param {string} data.country_english - Required english name
 * @param {string|null} [data.country_urdu] - Optional urdu name
 * @param {string|null} [data.country_abb] - Optional abbreviation
 * @returns {Promise<Object>} The inserted country row
 */
const createAdminCountry = async ({ country_english, country_urdu, country_abb }) => {
    const query = `
        INSERT INTO countries (country_english, country_urdu, country_abb)
        VALUES ($1, $2, $3)
        RETURNING country_id, country_english, country_urdu, country_abb, is_active
    `;
    
    // Explicitly pass undefined as null for postgres parameterization compatibility
    const params = [
        country_english, 
        country_urdu !== undefined ? country_urdu : null, 
        country_abb !== undefined ? country_abb : null
    ];
    
    const result = await pool.query(query, params);
    return result.rows[0];
};

/**
 * Finds a country by English name (case-insensitive).
 * 
 * @param {string} country_english 
 * @returns {Promise<Object|null>} The country row or null
 */
const findCountryByEnglishInsensitive = async (country_english) => {
    const query = `
        SELECT country_id, country_english, country_urdu, country_abb, is_active
        FROM countries
        WHERE LOWER(country_english) = LOWER($1)
    `;
    const result = await pool.query(query, [country_english]);
    return result.rows.length ? result.rows[0] : null;
};

/**
 * Finds a country by Abbreviation (case-insensitive).
 * 
 * @param {string} country_abb 
 * @returns {Promise<Object|null>} The country row or null
 */
const findCountryByAbbreviationInsensitive = async (country_abb) => {
    const query = `
        SELECT country_id, country_english, country_urdu, country_abb, is_active
        FROM countries
        WHERE LOWER(country_abb) = LOWER($1)
    `;
    const result = await pool.query(query, [country_abb]);
    return result.rows.length ? result.rows[0] : null;
};

/**
 * Gets a specific country by ID.
 * 
 * @param {string|number} countryId 
 * @returns {Promise<Object|null>}
 */
const getAdminCountryById = async (countryId) => {
    const query = `
        SELECT country_id, country_english, country_urdu, country_abb, is_active
        FROM countries
        WHERE country_id = $1
    `;
    const result = await pool.query(query, [countryId]);
    return result.rows.length ? result.rows[0] : null;
};

/**
 * Finds a country by English name (case-insensitive), excluding a specific country ID.
 * 
 * @param {string} country_english 
 * @param {string|number} excludeCountryId 
 * @returns {Promise<Object|null>}
 */
const findCountryByEnglishInsensitiveExcludingId = async (country_english, excludeCountryId) => {
    const query = `
        SELECT country_id, country_english, country_urdu, country_abb, is_active
        FROM countries
        WHERE LOWER(country_english) = LOWER($1)
          AND country_id <> $2
        LIMIT 1
    `;
    const result = await pool.query(query, [country_english, excludeCountryId]);
    return result.rows.length ? result.rows[0] : null;
};

/**
 * Finds a country by Abbreviation (case-insensitive), excluding a specific country ID.
 * 
 * @param {string} country_abb 
 * @param {string|number} excludeCountryId 
 * @returns {Promise<Object|null>}
 */
const findCountryByAbbreviationInsensitiveExcludingId = async (country_abb, excludeCountryId) => {
    const query = `
        SELECT country_id, country_english, country_urdu, country_abb, is_active
        FROM countries
        WHERE LOWER(country_abb) = LOWER($1)
          AND country_id <> $2
        LIMIT 1
    `;
    const result = await pool.query(query, [country_abb, excludeCountryId]);
    return result.rows.length ? result.rows[0] : null;
};

/**
 * Updates an existing country.
 * 
 * @param {string|number} countryId 
 * @param {Object} data 
 * @param {string} data.country_english
 * @param {string|null} data.country_urdu
 * @param {string|null} data.country_abb
 * @param {boolean} data.is_active
 * @returns {Promise<Object>}
 */
const updateAdminCountry = async (countryId, { country_english, country_urdu, country_abb, is_active }) => {
    const query = `
        UPDATE countries
        SET
            country_english = $1,
            country_urdu = $2,
            country_abb = $3,
            is_active = $4
        WHERE country_id = $5
        RETURNING country_id, country_english, country_urdu, country_abb, is_active
    `;
    const params = [
        country_english,
        country_urdu !== undefined ? country_urdu : null,
        country_abb !== undefined ? country_abb : null,
        is_active,
        countryId
    ];
    
    const result = await pool.query(query, params);
    return result.rows[0];
};

/**
 * Checks if a country has dependent records in other tables.
 * 
 * @param {string|number} countryId 
 * @returns {Promise<Object>}
 */
const getCountryDependencies = async (countryId) => {
    // Check customers
    const custRes = await pool.query(`SELECT COUNT(*) FROM customers WHERE country_id = $1`, [countryId]);
    const custCount = parseInt(custRes.rows[0].count, 10);

    // Check provinces
    const provRes = await pool.query(`SELECT COUNT(*) FROM provinces WHERE country_id = $1`, [countryId]);
    const provCount = parseInt(provRes.rows[0].count, 10);

    // Check pending_users
    const pendRes = await pool.query(`SELECT COUNT(*) FROM pending_users WHERE country_id = $1`, [countryId]);
    const pendCount = parseInt(pendRes.rows[0].count, 10);

    const dependencies = [];
    if (custCount > 0) dependencies.push({ table: 'customers', count: custCount });
    if (provCount > 0) dependencies.push({ table: 'provinces', count: provCount });
    if (pendCount > 0) dependencies.push({ table: 'pending_users', count: pendCount });

    return {
        hasDependencies: dependencies.length > 0,
        dependencies
    };
};

/**
 * Deletes a country from the database.
 * 
 * @param {string|number} countryId 
 * @returns {Promise<Object|null>} The deleted row or null
 */
const deleteAdminCountry = async (countryId) => {
    const query = `
        DELETE FROM countries
        WHERE country_id = $1
        RETURNING country_id, country_english, country_urdu, country_abb, is_active
    `;
    const result = await pool.query(query, [countryId]);
    return result.rows.length ? result.rows[0] : null;
};

module.exports = {
    getAdminCountries,
    createAdminCountry,
    findCountryByEnglishInsensitive,
    findCountryByAbbreviationInsensitive,
    getAdminCountryById,
    findCountryByEnglishInsensitiveExcludingId,
    findCountryByAbbreviationInsensitiveExcludingId,
    updateAdminCountry,
    getCountryDependencies,
    deleteAdminCountry
};
