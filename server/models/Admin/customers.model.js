const { pool } = require('../../config/db');

/**
 * Retrieves a paginated list of customers for Admin Operations.
 *
 * @param {Object} [options={}]
 * @param {string} [options.search] - Free-text search on first name, middle name, last name, email, mobile, cnic, or exact customer_id.
 * @param {string} [options.status] - 'all', 'active', or 'inactive' (based on customers.is_active).
 * @param {number} [options.page=1] - 1-based page number.
 * @param {number} [options.limit=10] - Number of records per page.
 * @returns {Promise<{ rows: Array<Object>, pagination: { total: number, page: number, limit: number, totalPages: number } }>}
 */
const getAdminCustomers = async (options = {}) => {
  const {
    search,
    status,
    page = 1,
    limit = 10,
  } = options;

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const offset = (parsedPage - 1) * parsedLimit;

  const whereConditions = [];
  const params = [];

  // 1. Search filter: customer_first_name, customer_middle_name, customer_last_name, email, mobile, customer_id_number, and customer_id (if numeric)
  if (search && typeof search === 'string' && search.trim() !== '') {
    const trimmedSearch = search.trim();
    const searchPattern = `%${trimmedSearch}%`;
    const searchIndex = params.length + 1;
    params.push(searchPattern);

    const isPositiveInteger = /^[1-9]\d*$/.test(trimmedSearch);

    if (isPositiveInteger) {
      const idIndex = params.length + 1;
      params.push(trimmedSearch); // Raw string parameter for BIGINT equality
      whereConditions.push(`(
        c.customer_first_name ILIKE $${searchIndex}
        OR c.customer_middle_name ILIKE $${searchIndex}
        OR c.customer_last_name ILIKE $${searchIndex}
        OR c.email ILIKE $${searchIndex}
        OR c.mobile ILIKE $${searchIndex}
        OR c.customer_id_number ILIKE $${searchIndex}
        OR c.customer_id = $${idIndex}
      )`);
    } else {
      whereConditions.push(`(
        c.customer_first_name ILIKE $${searchIndex}
        OR c.customer_middle_name ILIKE $${searchIndex}
        OR c.customer_last_name ILIKE $${searchIndex}
        OR c.email ILIKE $${searchIndex}
        OR c.mobile ILIKE $${searchIndex}
        OR c.customer_id_number ILIKE $${searchIndex}
      )`);
    }
  }

  // 2. Status filter: customers.is_active is authoritative
  if (status && typeof status === 'string') {
    const cleanStatus = status.trim().toLowerCase();
    if (cleanStatus === 'active') {
      whereConditions.push('c.is_active = true');
    } else if (cleanStatus === 'inactive') {
      whereConditions.push('c.is_active = false');
    }
    // 'all' or unrecognized status causes no filter
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // 3. Total filtered count query
  const countQuery = `
    SELECT COUNT(*)::text AS total
    FROM customers c
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0]?.total || '0', 10);

  // 4. Paginated data query with independent pre-aggregated child counts
  const dataParams = [...params];
  const limitIndex = dataParams.length + 1;
  dataParams.push(parsedLimit);
  const offsetIndex = dataParams.length + 1;
  dataParams.push(offset);

  const dataQuery = `
    SELECT
      c.customer_id::text AS customer_id,
      c.user_id::text AS user_id,
      ct.title_abb,
      c.customer_first_name,
      c.customer_middle_name,
      c.customer_last_name,
      TRIM(CONCAT_WS(' ', ct.title_abb, c.customer_first_name, c.customer_middle_name, c.customer_last_name)) AS customer_name,
      c.email,
      c.mobile,
      c.customer_id_number,
      c.date_of_registration,
      c.is_active,
      COALESCE(prop_agg.total_properties, 0)::text AS total_properties,
      COALESCE(req_agg.total_requests, 0)::text AS total_requests
    FROM customers c
    LEFT JOIN customer_titles ct ON ct.customer_title_id = c.customer_title_id
    LEFT JOIN (
      SELECT
        customer_id,
        COUNT(property_id) AS total_properties
      FROM properties
      GROUP BY customer_id
    ) prop_agg ON prop_agg.customer_id = c.customer_id
    LEFT JOIN (
      SELECT
        customer_id,
        COUNT(request_id) AS total_requests
      FROM customer_requests
      GROUP BY customer_id
    ) req_agg ON req_agg.customer_id = c.customer_id
    ${whereClause}
    ORDER BY c.date_of_registration DESC, c.customer_id DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `;

  const dataResult = await pool.query(dataQuery, dataParams);

  return {
    rows: dataResult.rows,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: total === 0 ? 0 : Math.ceil(total / parsedLimit),
    },
  };
};

/**
 * Retrieves global customer summary metrics for Admin Operations.
 * Metrics are global and completely independent of any list search/status filters.
 *
 * @returns {Promise<{ total_customers: string, active_customers: string, inactive_customers: string, new_customers: string }>}
 */
const getAdminCustomerStats = async () => {
  const query = `
    SELECT
      COUNT(*)::text AS total_customers,
      COUNT(*) FILTER (WHERE is_active = true)::text AS active_customers,
      COUNT(*) FILTER (WHERE is_active = false)::text AS inactive_customers,
      COUNT(*) FILTER (WHERE date_of_registration >= NOW() - INTERVAL '30 days')::text AS new_customers
    FROM customers;
  `;

  const result = await pool.query(query);
  const row = result.rows[0] || {};

  return {
    total_customers: row.total_customers || '0',
    active_customers: row.active_customers || '0',
    inactive_customers: row.inactive_customers || '0',
    new_customers: row.new_customers || '0',
  };
};

/**
 * Retrieves full details for a single customer by customer_id.
 * Casts all BIGINT identifiers and aggregates to strings.
 * Preserves true DB NULLs without replacing with placeholder strings.
 *
 * @param {string} customerId - Positive integer string representing customer_id.
 * @returns {Promise<Object|null>} - Customer details object or null if not found.
 */
const getAdminCustomerById = async (customerId) => {
  const query = `
    SELECT
      c.customer_id::text AS customer_id,
      c.user_id::text AS user_id,
      c.customer_title_id::text AS customer_title_id,
      ct.title_abb,
      ct.title_description,
      c.customer_first_name,
      c.customer_middle_name,
      c.customer_last_name,
      TRIM(CONCAT_WS(' ', ct.title_abb, c.customer_first_name, c.customer_middle_name, c.customer_last_name)) AS customer_name,
      c.gender_id::text AS gender_id,
      g.gender_english,
      c.identity_type_id::text AS identity_type_id,
      it.identity_description,
      c.customer_id_number,
      c.country_id::text AS country_id,
      co.country_english,
      c.mobile,
      c.email,
      c.mobile_allowed,
      c.web_allowed,
      c.date_of_registration,
      c.creation_date_time,
      c.update_date_time,
      c.created_by_user::text AS created_by_user,
      c.is_active,
      c.gps_coordinates,
      c.url_used,
      COALESCE(prop_agg.total_properties, 0)::text AS total_properties,
      COALESCE(req_agg.total_requests, 0)::text AS total_requests,
      COALESCE(visit_agg.total_property_visits, 0)::text AS total_property_visits
    FROM customers c
    LEFT JOIN customer_titles ct ON ct.customer_title_id = c.customer_title_id
    LEFT JOIN identity_types it ON it.identity_type_id = c.identity_type_id
    LEFT JOIN genders g ON g.gender_id = c.gender_id
    LEFT JOIN countries co ON co.country_id = c.country_id
    LEFT JOIN (
      SELECT
        customer_id,
        COUNT(property_id) AS total_properties
      FROM properties
      WHERE customer_id = $1
      GROUP BY customer_id
    ) prop_agg ON prop_agg.customer_id = c.customer_id
    LEFT JOIN (
      SELECT
        customer_id,
        COUNT(request_id) AS total_requests
      FROM customer_requests
      WHERE customer_id = $1
      GROUP BY customer_id
    ) req_agg ON req_agg.customer_id = c.customer_id
    LEFT JOIN (
      SELECT
        visitor_customer_id,
        COUNT(visit_id) AS total_property_visits
      FROM property_visits
      WHERE visitor_customer_id = $1
      GROUP BY visitor_customer_id
    ) visit_agg ON visit_agg.visitor_customer_id = c.customer_id
    WHERE c.customer_id = $1;
  `;

  const result = await pool.query(query, [customerId]);
  return result.rows[0] || null;
};

module.exports = {
  getAdminCustomers,
  getAdminCustomerStats,
  getAdminCustomerById,
};

