const { pool } = require('../../config/db');

/**
 * Retrieves global summary metrics for Admin Customer Requests.
 *
 * @returns {Promise<Object>}
 */
const getAdminRequestStats = async () => {
  const query = `
    SELECT
      COUNT(DISTINCT cr.request_id)::int AS total,
      COUNT(DISTINCT cr.request_id) FILTER (WHERE LOWER(COALESCE(st.request_status_english, 'Pending')) = 'pending')::int AS pending,
      COUNT(DISTINCT cr.request_id) FILTER (WHERE LOWER(COALESCE(st.request_status_english, '')) = 'under review')::int AS "underReview",
      COUNT(DISTINCT cr.request_id) FILTER (WHERE LOWER(COALESCE(st.request_status_english, '')) IN ('assigned', 'in progress'))::int AS "inOps",
      COUNT(DISTINCT cr.request_id) FILTER (WHERE LOWER(COALESCE(st.request_status_english, '')) = 'completed')::int AS completed,
      COUNT(DISTINCT cr.request_id) FILTER (WHERE LOWER(COALESCE(st.request_status_english, '')) = 'rejected')::int AS rejected,
      COUNT(DISTINCT cr.request_id) FILTER (WHERE LOWER(COALESCE(st.request_status_english, '')) = 'withdrawn')::int AS withdrawn,
      COUNT(DISTINCT cr.request_id) FILTER (WHERE cr.request_purpose_id IS NOT NULL)::int AS "propertyReqs",
      COUNT(DISTINCT cr.request_id) FILTER (WHERE cr.service_id IS NOT NULL)::int AS "serviceReqs"
    FROM customer_requests cr
    LEFT JOIN customer_request_status_history sh ON cr.request_id = sh.request_id AND sh.is_active = true
    LEFT JOIN customer_request_status_types st ON sh.request_status_type_id = st.request_status_type_id
    WHERE cr.is_active = true;
  `;

  const { rows } = await pool.query(query);
  const r = rows[0] || {};

  return {
    total: r.total || 0,
    pending: r.pending || 0,
    underReview: r.underReview || 0,
    inOps: r.inOps || 0,
    completed: r.completed || 0,
    rejected: r.rejected || 0,
    withdrawn: r.withdrawn || 0,
    propertyReqs: r.propertyReqs || 0,
    serviceReqs: r.serviceReqs || 0,
  };
};

/**
 * Retrieves a paginated list of customer requests with search and multi-filtering.
 *
 * @param {Object} [options={}]
 * @param {string} [options.search]
 * @param {string} [options.category] - 'PROPERTY' | 'SERVICE' | 'all'
 * @param {string} [options.status] - 'Pending', 'Under Review', etc. or 'all'
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 * @returns {Promise<{ rows: Array<Object>, pagination: Object }>}
 */
const getAdminRequests = async (options = {}) => {
  const {
    search,
    category,
    status,
    page = 1,
    limit = 10,
  } = options;

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const offset = (parsedPage - 1) * parsedLimit;

  const whereConditions = ['cr.is_active = true'];
  const params = [];

  // 1. Search filter
  if (search && typeof search === 'string' && search.trim() !== '') {
    const trimmed = search.trim();
    const searchPattern = `%${trimmed}%`;
    const searchIdx = params.length + 1;
    params.push(searchPattern);

    // Support REQ-021 or exact numeric ID
    const reqMatch = trimmed.match(/^REQ-(\d+)$/i);
    const numericId = reqMatch ? reqMatch[1] : (/^\d+$/.test(trimmed) ? trimmed : null);

    if (numericId) {
      const idIdx = params.length + 1;
      params.push(numericId);
      whereConditions.push(`(
        cr.request_id = $${idIdx}
        OR cu.customer_first_name ILIKE $${searchIdx}
        OR cu.customer_last_name ILIKE $${searchIdx}
        OR cu.mobile ILIKE $${searchIdx}
        OR ps.service_english ILIKE $${searchIdx}
        OR pp.purpose_description ILIKE $${searchIdx}
        OR cr.request_description ILIKE $${searchIdx}
      )`);
    } else {
      whereConditions.push(`(
        cu.customer_first_name ILIKE $${searchIdx}
        OR cu.customer_last_name ILIKE $${searchIdx}
        OR cu.mobile ILIKE $${searchIdx}
        OR ps.service_english ILIKE $${searchIdx}
        OR pp.purpose_description ILIKE $${searchIdx}
        OR cr.request_description ILIKE $${searchIdx}
      )`);
    }
  }

  // 2. Category filter ('PROPERTY' | 'SERVICE' | 'all')
  if (category && typeof category === 'string' && category.toLowerCase() !== 'all') {
    if (category.toUpperCase() === 'PROPERTY') {
      whereConditions.push('cr.request_purpose_id IS NOT NULL');
    } else if (category.toUpperCase() === 'SERVICE') {
      whereConditions.push('cr.service_id IS NOT NULL');
    }
  }

  // 3. Status filter
  if (status && typeof status === 'string' && status.toLowerCase() !== 'all') {
    const statusIdx = params.length + 1;
    params.push(status.trim().toLowerCase());
    whereConditions.push(`LOWER(COALESCE(st.request_status_english, 'pending')) = $${statusIdx}`);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Count Query
  const countQuery = `
    SELECT COUNT(DISTINCT cr.request_id)::text AS total
    FROM customer_requests cr
    JOIN customers cu ON cr.customer_id = cu.customer_id
    LEFT JOIN property_purposes pp ON cr.request_purpose_id = pp.purpose_id
    LEFT JOIN ppc_services ps ON cr.service_id = ps.service_id
    LEFT JOIN customer_request_status_history sh ON cr.request_id = sh.request_id AND sh.is_active = true
    LEFT JOIN customer_request_status_types st ON sh.request_status_type_id = st.request_status_type_id
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0]?.total || '0', 10);

  // Data Query
  const dataParams = [...params];
  const limitIdx = dataParams.length + 1;
  dataParams.push(parsedLimit);
  const offsetIdx = dataParams.length + 1;
  dataParams.push(offset);

  const dataQuery = `
    SELECT
      cr.request_id::text AS id,
      'REQ-' || LPAD(cr.request_id::text, 3, '0') AS formatted_id,
      cr.customer_id::text AS customer_id,
      TRIM(CONCAT_WS(' ', cu.customer_first_name, cu.customer_middle_name, cu.customer_last_name)) AS customer_name,
      cu.mobile AS customer_mobile,
      cu.email AS customer_email,
      CASE 
        WHEN cr.request_purpose_id IS NOT NULL THEN 'PROPERTY'
        ELSE 'SERVICE'
      END AS category,
      pp.purpose_description AS purpose,
      ps.service_english AS service,
      cr.property_id::text AS property_id,
      CASE 
        WHEN cr.property_id IS NOT NULL THEN 'PRP-' || LPAD(cr.property_id::text, 3, '0')
        ELSE NULL
      END AS formatted_property_id,
      pt_linked.property_type_description AS linked_property_type,
      soc_linked.society_english AS linked_society,
      cit_linked.city_english AS linked_city,
      cr.request_description AS description,
      cr.request_audio_url AS audio_url,
      cr.creation_date_time AS created_at,
      COALESCE(st.request_status_english, 'Pending') AS status,
      st.request_status_abb AS status_abb,
      pr.minimum_budget,
      pr.maximum_budget,
      pt_req.property_type_description AS req_property_type,
      soc_req.society_english AS req_society,
      cit_req.city_english AS req_city
    FROM customer_requests cr
    JOIN customers cu ON cr.customer_id = cu.customer_id
    LEFT JOIN property_purposes pp ON cr.request_purpose_id = pp.purpose_id
    LEFT JOIN ppc_services ps ON cr.service_id = ps.service_id
    LEFT JOIN properties prop_linked ON cr.property_id = prop_linked.property_id
    LEFT JOIN property_types pt_linked ON prop_linked.property_type_id = pt_linked.property_type_id
    LEFT JOIN areas a_linked ON prop_linked.area_id = a_linked.area_id
    LEFT JOIN societies soc_linked ON a_linked.society_id = soc_linked.society_id
    LEFT JOIN cities cit_linked ON soc_linked.city_id = cit_linked.city_id
    LEFT JOIN customer_request_status_history sh ON cr.request_id = sh.request_id AND sh.is_active = true
    LEFT JOIN customer_request_status_types st ON sh.request_status_type_id = st.request_status_type_id
    LEFT JOIN customer_request_property_requirements pr ON cr.request_id = pr.request_id AND pr.is_active = true
    LEFT JOIN property_types pt_req ON pr.property_type_id = pt_req.property_type_id
    LEFT JOIN societies soc_req ON pr.society_id = soc_req.society_id
    LEFT JOIN cities cit_req ON pr.city_id = cit_req.city_id
    ${whereClause}
    ORDER BY cr.creation_date_time DESC, cr.request_id DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx};
  `;

  const dataResult = await pool.query(dataQuery, dataParams);

  return {
    rows: dataResult.rows,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1,
    },
  };
};

/**
 * Retrieves a single customer request by ID with complete 360-degree inspection detail.
 *
 * @param {string|number} requestId
 * @returns {Promise<Object|null>}
 */
const getAdminRequestById = async (requestId) => {
  const query = `
    SELECT
      cr.request_id::text AS id,
      'REQ-' || LPAD(cr.request_id::text, 3, '0') AS formatted_id,
      cr.customer_id::text AS customer_id,
      cu.user_id::text AS user_id,
      TRIM(CONCAT_WS(' ', cu.customer_first_name, cu.customer_middle_name, cu.customer_last_name)) AS customer_name,
      cu.mobile AS customer_mobile,
      cu.email AS customer_email,
      CASE 
        WHEN cr.request_purpose_id IS NOT NULL THEN 'PROPERTY'
        ELSE 'SERVICE'
      END AS category,
      pp.purpose_description AS purpose,
      ps.service_english AS service,
      cr.property_id::text AS property_id,
      CASE 
        WHEN cr.property_id IS NOT NULL THEN 'PRP-' || LPAD(cr.property_id::text, 3, '0')
        ELSE NULL
      END AS formatted_property_id,
      pt_linked.property_type_description AS linked_property_type,
      soc_linked.society_english AS linked_society,
      cit_linked.city_english AS linked_city,
      cr.request_description AS description,
      cr.request_audio_url AS audio_url,
      cr.creation_date_time AS created_at,
      COALESCE(st.request_status_english, 'Pending') AS status,
      st.request_status_abb AS status_abb,
      pr.minimum_budget,
      pr.maximum_budget,
      pt_req.property_type_description AS req_property_type,
      soc_req.society_english AS req_society,
      cit_req.city_english AS req_city
    FROM customer_requests cr
    JOIN customers cu ON cr.customer_id = cu.customer_id
    LEFT JOIN property_purposes pp ON cr.request_purpose_id = pp.purpose_id
    LEFT JOIN ppc_services ps ON cr.service_id = ps.service_id
    LEFT JOIN properties prop_linked ON cr.property_id = prop_linked.property_id
    LEFT JOIN property_types pt_linked ON prop_linked.property_type_id = pt_linked.property_type_id
    LEFT JOIN areas a_linked ON prop_linked.area_id = a_linked.area_id
    LEFT JOIN societies soc_linked ON a_linked.society_id = soc_linked.society_id
    LEFT JOIN cities cit_linked ON soc_linked.city_id = cit_linked.city_id
    LEFT JOIN customer_request_status_history sh ON cr.request_id = sh.request_id AND sh.is_active = true
    LEFT JOIN customer_request_status_types st ON sh.request_status_type_id = st.request_status_type_id
    LEFT JOIN customer_request_property_requirements pr ON cr.request_id = pr.request_id AND pr.is_active = true
    LEFT JOIN property_types pt_req ON pr.property_type_id = pt_req.property_type_id
    LEFT JOIN societies soc_req ON pr.society_id = soc_req.society_id
    LEFT JOIN cities cit_req ON pr.city_id = cit_req.city_id
    WHERE cr.request_id = $1 AND cr.is_active = true;
  `;

  const { rows } = await pool.query(query, [requestId]);
  if (rows.length === 0) return null;

  const request = rows[0];

  // Fetch status audit history timeline
  const historyQuery = `
    SELECT
      sh.request_status_history_id::text AS history_id,
      st.request_status_english AS status,
      st.request_status_abb AS status_abb,
      sh.effective_date,
      sh.status_remarks AS remarks,
      sh.creation_date_time AS created_at,
      TRIM(CONCAT_WS(' ', u.user_first_name, u.user_last_name)) AS created_by_name
    FROM customer_request_status_history sh
    JOIN customer_request_status_types st ON sh.request_status_type_id = st.request_status_type_id
    LEFT JOIN users u ON sh.created_by_user = u.user_id
    WHERE sh.request_id = $1
    ORDER BY sh.creation_date_time DESC, sh.request_status_history_id DESC;
  `;

  const historyRes = await pool.query(historyQuery, [requestId]);
  request.status_history = historyRes.rows;

  return request;
};

/**
 * Updates a customer request's status and records an audit log entry in status history.
 *
 * @param {string|number} requestId
 * @param {string} statusName - 'Pending' | 'Under Review' | 'Assigned' | 'In Progress' | 'Completed' | 'Rejected' | 'Withdrawn'
 * @param {string} [remarks] - Optional administrator audit remarks
 * @param {string|number} [userId] - User ID of the administrator making the update
 * @returns {Promise<Object>}
 */
const updateAdminRequestStatus = async (requestId, statusName, remarks, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify request exists
    const reqRes = await client.query(
      'SELECT request_id, customer_id FROM customer_requests WHERE request_id = $1 AND is_active = true FOR UPDATE',
      [requestId]
    );
    if (reqRes.rowCount === 0) {
      throw new Error('Customer request not found');
    }

    // 2. Resolve status_type_id
    const statusRes = await client.query(
      'SELECT request_status_type_id, request_status_english, request_status_abb FROM customer_request_status_types WHERE LOWER(request_status_english) = LOWER($1)',
      [statusName]
    );
    if (statusRes.rowCount === 0) {
      throw new Error(`Invalid status type: ${statusName}`);
    }
    const statusType = statusRes.rows[0];

    // 3. Deactivate previous active status history records for this request
    await client.query(
      `UPDATE customer_request_status_history
       SET is_active = false, update_date_time = CURRENT_TIMESTAMP
       WHERE request_id = $1 AND is_active = true`,
      [requestId]
    );

    // 4. Insert new active status history record
    const insertHistoryQuery = `
      INSERT INTO customer_request_status_history (
        request_id,
        request_status_type_id,
        effective_date,
        status_remarks,
        creation_date_time,
        update_date_time,
        created_by_user,
        is_active
      ) VALUES (
        $1, $2, CURRENT_DATE, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $4, true
      ) RETURNING request_status_history_id;
    `;
    await client.query(insertHistoryQuery, [
      requestId,
      statusType.request_status_type_id,
      remarks || null,
      userId || null,
    ]);

    // 5. Update timestamp on parent customer_requests
    await client.query(
      `UPDATE customer_requests
       SET update_date_time = CURRENT_TIMESTAMP
       WHERE request_id = $1`,
      [requestId]
    );

    await client.query('COMMIT');

    // 6. Return fresh updated request with complete detail and audit timeline
    return await getAdminRequestById(requestId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getAdminRequestStats,
  getAdminRequests,
  getAdminRequestById,
  updateAdminRequestStatus,
};
