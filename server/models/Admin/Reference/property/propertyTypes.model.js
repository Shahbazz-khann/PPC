const { pool } = require('../../../../config/db');

/**
 * Retrieves Property Types reference data.
 * Provides parameterized search and filtering, with BigInt safety.
 */
const getAdminPropertyTypes = async ({ search, status, page = 1, limit = 10 } = {}) => {
  try {
    let baseQuery = `
      FROM property_types p
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      baseQuery += ` AND (p.property_type_description ILIKE $${paramIndex} OR p.property_type_urdu ILIKE $${paramIndex} OR p.property_type_abb ILIKE $${paramIndex})`;
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
    baseQuery += ` ORDER BY p.property_type_description ASC, p.property_type_id ASC`;

    // Pagination
    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const fullQuery = `
      SELECT 
        p.property_type_id,
        p.property_type_description,
        p.property_type_urdu,
        p.property_type_abb,
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

/**
 * Creates a new Property Type.
 * Expects English description (required), Urdu (optional), and Abbreviation (optional).
 * is_active is omitted from the INSERT so it defaults to true.
 */
const createAdminPropertyType = async ({
  property_type_description,
  property_type_urdu,
  property_type_abb
}) => {
  try {
    const query = `
      INSERT INTO property_types (
        property_type_description,
        property_type_urdu,
        property_type_abb
      )
      VALUES ($1, $2, $3)
      RETURNING
        property_type_id,
        property_type_description,
        property_type_urdu,
        property_type_abb,
        is_active
    `;
    
    // Convert blank strings to genuine NULL for optional fields
    const urdu = property_type_urdu?.trim() ? property_type_urdu.trim() : null;
    const abb = property_type_abb?.trim() ? property_type_abb.trim() : null;

    const values = [property_type_description, urdu, abb];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a Property Type by case-insensitive English description.
 * Used to enforce global case-insensitive uniqueness before creation.
 * Returns the exact conflicting row regardless of active/inactive status.
 */
const findPropertyTypeByDescriptionInsensitive = async (propertyTypeDescription) => {
  try {
    const query = `
      SELECT 
        property_type_id,
        property_type_description,
        is_active
      FROM property_types
      WHERE LOWER(property_type_description) = LOWER($1)
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [propertyTypeDescription]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a single Property Type by its ID.
 * Returns only the fields required for Edit.
 */
const getAdminPropertyTypeById = async (propertyTypeId) => {
  try {
    const query = `
      SELECT 
        property_type_id,
        property_type_description,
        property_type_urdu,
        property_type_abb,
        is_active
      FROM property_types
      WHERE property_type_id = $1
    `;
    const { rows } = await pool.query(query, [propertyTypeId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a Property Type by case-insensitive English description, excluding a specific ID.
 * Used for duplicate checking during Edit to allow self-edit or case-only self-edit.
 */
const findPropertyTypeByDescriptionInsensitiveExcludingId = async (propertyTypeDescription, propertyTypeId) => {
  try {
    const query = `
      SELECT 
        property_type_id,
        property_type_description,
        is_active
      FROM property_types
      WHERE LOWER(property_type_description) = LOWER($1)
      AND property_type_id <> $2
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [propertyTypeDescription, propertyTypeId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates a Property Type.
 * Updates all editable fields and returns the updated row.
 */
const updateAdminPropertyType = async (propertyTypeId, {
  property_type_description,
  property_type_urdu,
  property_type_abb,
  is_active
}) => {
  try {
    const query = `
      UPDATE property_types
      SET 
        property_type_description = $1,
        property_type_urdu = $2,
        property_type_abb = $3,
        is_active = $4
      WHERE property_type_id = $5
      RETURNING 
        property_type_id,
        property_type_description,
        property_type_urdu,
        property_type_abb,
        is_active
    `;
    const values = [
      property_type_description,
      property_type_urdu,
      property_type_abb,
      is_active,
      propertyTypeId
    ];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Checks if a property type has dependent records in child tables.
 * 
 * @param {string} propertyTypeId 
 * @returns {Promise<Object>}
 */
const getPropertyTypeDependencies = async (propertyTypeId) => {
  try {
    // Check properties
    const propRes = await pool.query(
      `SELECT COUNT(*)::int AS count FROM properties WHERE property_type_id = $1`, 
      [propertyTypeId]
    );
    const propCount = propRes.rows[0].count;

    // Check customer_request_property_requirements
    const reqRes = await pool.query(
      `SELECT COUNT(*)::int AS count FROM customer_request_property_requirements WHERE property_type_id = $1`, 
      [propertyTypeId]
    );
    const reqCount = reqRes.rows[0].count;

    const dependencies = [];
    if (propCount > 0) dependencies.push({ table: 'properties', count: propCount });
    if (reqCount > 0) dependencies.push({ table: 'customer_request_property_requirements', count: reqCount });

    return {
      hasDependencies: dependencies.length > 0,
      dependencies
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Physically deletes a Property Type from the database.
 * Does not bypass constraints; throws 23503 if in use.
 * 
 * @param {string} propertyTypeId 
 * @returns {Promise<Object|null>} The deleted row or null if not found
 */
const deleteAdminPropertyType = async (propertyTypeId) => {
  try {
    const query = `
      DELETE FROM property_types
      WHERE property_type_id = $1
      RETURNING
        property_type_id,
        property_type_description,
        property_type_urdu,
        property_type_abb,
        is_active
    `;
    const { rows } = await pool.query(query, [propertyTypeId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAdminPropertyTypes,
  createAdminPropertyType,
  findPropertyTypeByDescriptionInsensitive,
  getAdminPropertyTypeById,
  findPropertyTypeByDescriptionInsensitiveExcludingId,
  updateAdminPropertyType,
  getPropertyTypeDependencies,
  deleteAdminPropertyType
};
