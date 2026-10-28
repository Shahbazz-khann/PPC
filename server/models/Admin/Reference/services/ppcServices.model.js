const { pool } = require('../../../../config/db');

/**
 * Retrieves PPC Services reference data with search, status filtering, service type filtering, and pagination.
 */
const getAdminPpcServices = async ({ search, status, service_type_id, page = 1, limit = 10 } = {}) => {
  try {
    let baseQuery = `
      FROM ppc_services s
      LEFT JOIN ppc_service_types st ON s.service_type_id = st.service_type_id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Service Type Filter
    if (service_type_id !== undefined && service_type_id !== null && service_type_id !== 'all') {
      baseQuery += ` AND s.service_type_id = $${paramIndex}`;
      params.push(service_type_id);
      paramIndex++;
    }

    // Search filter across English, Urdu, Abbreviation, and Service Type name
    if (search && typeof search === 'string' && search.trim() !== '') {
      baseQuery += ` AND (
        s.service_english ILIKE $${paramIndex} 
        OR s.service_urdu ILIKE $${paramIndex} 
        OR s.service_abb ILIKE $${paramIndex}
        OR st.service_type_english ILIKE $${paramIndex}
      )`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Status filter
    if (status && status !== 'all') {
      baseQuery += ` AND s.is_active = $${paramIndex}`;
      params.push(status === 'active');
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (SELECT 1 ${baseQuery}) as total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Default Ordering
    baseQuery += ` ORDER BY s.service_id ASC`;

    // Pagination
    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const fullQuery = `
      SELECT 
        s.service_id,
        s.service_type_id,
        st.service_type_english,
        s.service_english,
        s.service_urdu,
        s.service_abb,
        s.is_active
      ${baseQuery}
    `;

    const { rows } = await pool.query(fullQuery, params);

    return {
      rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves a single PPC service by ID.
 */
const getAdminPpcServiceById = async (serviceId) => {
  try {
    const query = `
      SELECT 
        s.service_id,
        s.service_type_id,
        st.service_type_english,
        s.service_english,
        s.service_urdu,
        s.service_abb,
        s.is_active
      FROM ppc_services s
      LEFT JOIN ppc_service_types st ON s.service_type_id = st.service_type_id
      WHERE s.service_id = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [serviceId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a service by case-insensitive English name under a specific service type.
 */
const findPpcServiceByEnglishAndType = async (englishName, serviceTypeId) => {
  try {
    const query = `
      SELECT 
        service_id,
        service_type_id,
        service_english
      FROM ppc_services
      WHERE LOWER(TRIM(service_english)) = LOWER(TRIM($1))
        AND service_type_id = $2
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [englishName, serviceTypeId]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Creates a new PPC service in reference data.
 */
const createAdminPpcService = async ({ service_type_id, service_english, service_urdu, service_abb }) => {
  try {
    const query = `
      INSERT INTO ppc_services (
        service_type_id,
        service_english,
        service_urdu,
        service_abb,
        is_active
      ) VALUES ($1, $2, $3, $4, true)
      RETURNING service_id
    `;
    const values = [service_type_id, service_english, service_urdu || null, service_abb || null];
    const { rows } = await pool.query(query, values);
    
    // Return complete record with joined service_type_english
    return await getAdminPpcServiceById(rows[0].service_id);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAdminPpcServices,
  getAdminPpcServiceById,
  findPpcServiceByEnglishAndType,
  createAdminPpcService
};

