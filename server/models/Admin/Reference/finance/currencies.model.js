const { pool } = require('../../../../config/db');

/**
 * Retrieves currencies for the Admin Reference Table.
 * Supports search and status filtering.
 * 
 * @param {Object} options 
 * @param {string} [options.search] - Optional search text (English, Urdu, Code, Symbol).
 * @param {string} [options.status] - Optional status filter: 'active', 'inactive', 'all'.
 * @returns {Promise<Array>} List of currency rows.
 */
const getAdminCurrencies = async (options = {}) => {
  const { search, status } = options;

  let query = `
    SELECT currency_id, currency_english, currency_urdu, currency_code, currency_symbol, is_active
    FROM currencies
    WHERE 1=1
  `;
  const params = [];

  if (status === 'active') {
    query += ` AND is_active = true`;
  } else if (status === 'inactive') {
    query += ` AND is_active = false`;
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const searchIdx = params.length + 1;
    query += ` AND (
      currency_english ILIKE $${searchIdx}
      OR currency_urdu ILIKE $${searchIdx}
      OR currency_code ILIKE $${searchIdx}
      OR currency_symbol ILIKE $${searchIdx}
    )`;
    params.push(`%${search.trim()}%`);
  }

  query += ` ORDER BY currency_id ASC`;

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Retrieves a single currency by ID.
 */
const getAdminCurrencyById = async (currencyId) => {
  const query = `
    SELECT currency_id, currency_english, currency_urdu, currency_code, currency_symbol, is_active
    FROM currencies
    WHERE currency_id = $1;
  `;
  const result = await pool.query(query, [currencyId]);
  return result.rows[0] || null;
};

/**
 * Finds a currency by English name (case-insensitive).
 */
const findCurrencyByEnglishInsensitive = async (englishName) => {
  const query = `
    SELECT currency_id, currency_english, currency_code
    FROM currencies
    WHERE LOWER(currency_english) = LOWER($1);
  `;
  const result = await pool.query(query, [englishName.trim()]);
  return result.rows[0] || null;
};

/**
 * Finds a currency by Code (case-insensitive).
 */
const findCurrencyByCodeInsensitive = async (code) => {
  const query = `
    SELECT currency_id, currency_english, currency_code
    FROM currencies
    WHERE LOWER(currency_code) = LOWER($1);
  `;
  const result = await pool.query(query, [code.trim()]);
  return result.rows[0] || null;
};

/**
 * Finds duplicate English name excluding current ID.
 */
const findCurrencyByEnglishInsensitiveExcludingId = async (englishName, id) => {
  const query = `
    SELECT currency_id, currency_english, currency_code
    FROM currencies
    WHERE LOWER(currency_english) = LOWER($1) AND currency_id != $2;
  `;
  const result = await pool.query(query, [englishName.trim(), id]);
  return result.rows[0] || null;
};

/**
 * Finds duplicate Code excluding current ID.
 */
const findCurrencyByCodeInsensitiveExcludingId = async (code, id) => {
  const query = `
    SELECT currency_id, currency_english, currency_code
    FROM currencies
    WHERE LOWER(currency_code) = LOWER($1) AND currency_id != $2;
  `;
  const result = await pool.query(query, [code.trim(), id]);
  return result.rows[0] || null;
};

/**
 * Creates a new currency in the database.
 */
const createAdminCurrency = async ({ currency_english, currency_urdu, currency_code, currency_symbol, is_active = true }) => {
  const query = `
    INSERT INTO currencies (currency_english, currency_urdu, currency_code, currency_symbol, is_active)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING currency_id, currency_english, currency_urdu, currency_code, currency_symbol, is_active;
  `;
  const params = [
    currency_english.trim(),
    currency_urdu ? currency_urdu.trim() : null,
    currency_code.trim().toUpperCase(),
    currency_symbol ? currency_symbol.trim() : null,
    is_active === undefined ? true : Boolean(is_active)
  ];
  const result = await pool.query(query, params);
  return result.rows[0];
};

/**
 * Updates an existing currency.
 */
const updateAdminCurrency = async (currencyId, { currency_english, currency_urdu, currency_code, currency_symbol, is_active }) => {
  const query = `
    UPDATE currencies
    SET 
      currency_english = $1,
      currency_urdu = $2,
      currency_code = $3,
      currency_symbol = $4,
      is_active = $5
    WHERE currency_id = $6
    RETURNING currency_id, currency_english, currency_urdu, currency_code, currency_symbol, is_active;
  `;
  const params = [
    currency_english.trim(),
    currency_urdu ? currency_urdu.trim() : null,
    currency_code.trim().toUpperCase(),
    currency_symbol ? currency_symbol.trim() : null,
    Boolean(is_active),
    currencyId
  ];
  const result = await pool.query(query, params);
  return result.rows[0];
};

/**
 * Checks for dependencies before deletion (e.g. properties referencing demand_currency_id).
 */
const getCurrencyDependencies = async (currencyId) => {
  const dependencies = [];

  try {
    const propRes = await pool.query(
      `SELECT COUNT(*) as count FROM property_demand WHERE demand_currency_id = $1`,
      [currencyId]
    );
    const count = parseInt(propRes.rows[0].count, 10);
    if (count > 0) {
      dependencies.push({ entity: 'property_demand', count });
    }
  } catch (err) {
    // If property_demand table or column doesn't exist, ignore
  }

  return dependencies;
};

/**
 * Deletes a currency by ID.
 */
const deleteAdminCurrency = async (currencyId) => {
  const query = `DELETE FROM currencies WHERE currency_id = $1 RETURNING currency_id;`;
  const result = await pool.query(query, [currencyId]);
  return result.rows[0] || null;
};

module.exports = {
  getAdminCurrencies,
  getAdminCurrencyById,
  findCurrencyByEnglishInsensitive,
  findCurrencyByCodeInsensitive,
  findCurrencyByEnglishInsensitiveExcludingId,
  findCurrencyByCodeInsensitiveExcludingId,
  createAdminCurrency,
  updateAdminCurrency,
  getCurrencyDependencies,
  deleteAdminCurrency
};
