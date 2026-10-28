const { pool } = require('../../../../config/db');

/**
 * Retrieves Property Purposes reference data.
 * Provides parameterized search and filtering, with BigInt safety.
 */
const getAdminPropertyPurposes = async ({ search, status, page = 1, limit = 10 } = {}) => {
  try {
    let baseQuery = `
      FROM property_purposes p
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      baseQuery += ` AND (p.purpose_description ILIKE $${paramIndex} OR p.purpose_urdu ILIKE $${paramIndex} OR p.purpose_abb ILIKE $${paramIndex})`;
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

    // Ordering: Using purpose_id ASC since they are seeded in a meaningful logical order (Sale=1, Purchase=2, Rent=3, Renovation=4, Lease=5)
    // and to match the common Reference API behavior.
    baseQuery += ` ORDER BY p.purpose_id ASC`;

    // Pagination
    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const fullQuery = `
      SELECT 
        p.purpose_id,
        p.purpose_description,
        p.purpose_urdu,
        p.purpose_abb,
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

module.exports = {
  getAdminPropertyPurposes
};
