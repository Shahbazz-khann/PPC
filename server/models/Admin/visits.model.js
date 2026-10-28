const { pool } = require('../../config/db');

/**
 * Retrieves global summary metrics for Admin Property Visits.
 *
 * @returns {Promise<Object>}
 */
const getAdminVisitStats = async () => {
  const query = `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (
        WHERE is_active = true 
          AND visit_actual_date IS NULL 
          AND visit_scheduled_date >= CURRENT_DATE
      )::int AS scheduled,
      COUNT(*) FILTER (
        WHERE is_active = true 
          AND visit_actual_date IS NOT NULL
      )::int AS completed,
      COUNT(*) FILTER (
        WHERE is_active = true 
          AND visit_actual_date IS NULL 
          AND visit_scheduled_date < CURRENT_DATE
      )::int AS overdue,
      COUNT(*) FILTER (
        WHERE is_active = false
      )::int AS cancelled
    FROM property_visits;
  `;

  const { rows } = await pool.query(query);
  const r = rows[0] || {};

  return {
    total: r.total || 0,
    scheduled: r.scheduled || 0,
    completed: r.completed || 0,
    overdue: r.overdue || 0,
    cancelled: r.cancelled || 0,
  };
};

/**
 * Retrieves a paginated list of property visits with multi-filtering and search.
 *
 * @param {Object} [options={}]
 * @param {string} [options.search]
 * @param {string} [options.status] - 'all' | 'Scheduled' | 'Completed' | 'Overdue' | 'Cancelled'
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 * @returns {Promise<{ rows: Array<Object>, pagination: Object }>}
 */
const getAdminVisits = async (options = {}) => {
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

  // Status Filter
  if (status && typeof status === 'string' && status.toLowerCase() !== 'all') {
    const s = status.trim().toLowerCase();
    if (s === 'completed') {
      whereConditions.push('pv.is_active = true AND pv.visit_actual_date IS NOT NULL');
    } else if (s === 'scheduled') {
      whereConditions.push('pv.is_active = true AND pv.visit_actual_date IS NULL AND pv.visit_scheduled_date >= CURRENT_DATE');
    } else if (s === 'overdue') {
      whereConditions.push('pv.is_active = true AND pv.visit_actual_date IS NULL AND pv.visit_scheduled_date < CURRENT_DATE');
    } else if (s === 'cancelled') {
      whereConditions.push('pv.is_active = false');
    }
  }

  // Search Filter
  if (search && typeof search === 'string' && search.trim() !== '') {
    const trimmed = search.trim();
    const searchPattern = `%${trimmed}%`;
    const searchIdx = params.length + 1;
    params.push(searchPattern);

    // Support VST-001 or numeric ID
    const vstMatch = trimmed.match(/^VST-(\d+)$/i);
    const prpMatch = trimmed.match(/^PRP-(\d+)$/i);
    const reqMatch = trimmed.match(/^REQ-(\d+)$/i);
    const numericId = vstMatch ? vstMatch[1] : (/^\d+$/.test(trimmed) ? trimmed : null);
    const propId = prpMatch ? prpMatch[1] : null;
    const reqId = reqMatch ? reqMatch[1] : null;

    const idChecks = [];
    if (numericId) {
      const idx = params.length + 1;
      params.push(numericId);
      idChecks.push(`pv.visit_id = $${idx}`);
    }
    if (propId) {
      const idx = params.length + 1;
      params.push(propId);
      idChecks.push(`pv.property_id = $${idx}`);
    }
    if (reqId) {
      const idx = params.length + 1;
      params.push(reqId);
      idChecks.push(`pv.request_id = $${idx}`);
    }

    const orClauses = [
      `cu.customer_first_name ILIKE $${searchIdx}`,
      `cu.customer_last_name ILIKE $${searchIdx}`,
      `cu.mobile ILIKE $${searchIdx}`,
      `emp.first_name ILIKE $${searchIdx}`,
      `emp.last_name ILIKE $${searchIdx}`,
      `soc.society_english ILIKE $${searchIdx}`,
      `cit.city_english ILIKE $${searchIdx}`,
      `pt.property_type_description ILIKE $${searchIdx}`,
      ...idChecks
    ];

    whereConditions.push(`(${orClauses.join(' OR ')})`);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Count Query
  const countQuery = `
    SELECT COUNT(*)::text AS total
    FROM property_visits pv
    JOIN properties p ON pv.property_id = p.property_id
    JOIN customers cu ON pv.visitor_customer_id = cu.customer_id
    LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
    LEFT JOIN areas a ON p.area_id = a.area_id
    LEFT JOIN societies soc ON a.society_id = soc.society_id
    LEFT JOIN cities cit ON soc.city_id = cit.city_id
    LEFT JOIN employees emp ON pv.visit_conducted_employee_id = emp.employee_id
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
      pv.visit_id::text AS id,
      'VST-' || LPAD(pv.visit_id::text, 3, '0') AS formatted_id,
      pv.property_id::text AS property_id,
      'PRP-' || LPAD(pv.property_id::text, 3, '0') AS formatted_property_id,
      COALESCE(p.property_description, 'Property #' || pv.property_id::text) AS property_title,
      pt.property_type_description AS property_type,
      soc.society_english AS society,
      cit.city_english AS city,
      p.property_size,
      u.uom_english AS property_size_uom,
      COALESCE(pic.picture_url, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80') AS property_image,
      COALESCE(pd.demand_amount::text, '125,000,000') AS demand_amount,
      
      pv.request_id::text AS request_id,
      'REQ-' || LPAD(pv.request_id::text, 3, '0') AS formatted_request_id,
      pp.purpose_description AS request_purpose,

      pv.visitor_customer_id::text AS visitor_customer_id,
      TRIM(CONCAT_WS(' ', cu.customer_first_name, cu.customer_middle_name, cu.customer_last_name)) AS customer_name,
      cu.mobile AS customer_mobile,
      cu.email AS customer_email,

      pv.visit_conducted_employee_id::text AS visit_conducted_employee_id,
      COALESCE(TRIM(CONCAT_WS(' ', emp.first_name, emp.middle_name, emp.last_name)), 'Unassigned') AS employee_name,
      COALESCE(des.designation_english, 'Field Operations Officer') AS employee_designation,
      emp.reference_mobile AS employee_mobile,

      TO_CHAR(pv.visit_scheduled_date, 'YYYY-MM-DD') AS visit_scheduled_date,
      TO_CHAR(pv.visit_scheduled_time, 'HH12:MI AM') AS visit_scheduled_time,
      TO_CHAR(pv.visit_actual_date, 'YYYY-MM-DD') AS visit_actual_date,
      TO_CHAR(pv.visit_actual_time, 'HH12:MI AM') AS visit_actual_time,

      CASE
        WHEN pv.is_active = false THEN 'Cancelled'
        WHEN pv.visit_actual_date IS NOT NULL THEN 'Completed'
        WHEN pv.visit_scheduled_date < CURRENT_DATE THEN 'Overdue'
        ELSE 'Scheduled'
      END AS status,

      pv.visitor_remarks,
      pv.visit_conducted_employee_remarks AS employee_remarks,
      pv.creation_date_time AS created_at,
      TRIM(CONCAT_WS(' ', u_creator.user_first_name, u_creator.user_last_name)) AS created_by_name
    FROM property_visits pv
    JOIN properties p ON pv.property_id = p.property_id
    JOIN customers cu ON pv.visitor_customer_id = cu.customer_id
    LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
    LEFT JOIN areas a ON p.area_id = a.area_id
    LEFT JOIN societies soc ON a.society_id = soc.society_id
    LEFT JOIN cities cit ON soc.city_id = cit.city_id
    LEFT JOIN uom u ON p.property_size_uom = u.uom_id
    LEFT JOIN property_demand pd ON p.property_id = pd.property_id AND pd.is_active = true
    LEFT JOIN customer_requests cr ON pv.request_id = cr.request_id
    LEFT JOIN property_purposes pp ON cr.request_purpose_id = pp.purpose_id
    LEFT JOIN employees emp ON pv.visit_conducted_employee_id = emp.employee_id
    LEFT JOIN designations des ON emp.designation_id = des.designation_id
    LEFT JOIN users u_creator ON pv.created_by_user = u_creator.user_id
    LEFT JOIN LATERAL (
      SELECT picture_url
      FROM property_pictures
      WHERE property_id = p.property_id AND is_active = true
      ORDER BY display_order ASC, property_picture_id ASC
      LIMIT 1
    ) pic ON true
    ${whereClause}
    ORDER BY
      COALESCE(pv.visit_scheduled_date, pv.creation_date_time::date) DESC,
      pv.visit_id DESC
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
 * Retrieves a single property visit by ID with complete 360-degree inspection detail.
 *
 * @param {string|number} visitId
 * @returns {Promise<Object|null>}
 */
const getAdminVisitById = async (visitId) => {
  const query = `
    SELECT
      pv.visit_id::text AS id,
      'VST-' || LPAD(pv.visit_id::text, 3, '0') AS formatted_id,
      pv.property_id::text AS property_id,
      'PRP-' || LPAD(pv.property_id::text, 3, '0') AS formatted_property_id,
      COALESCE(p.property_description, 'Property #' || pv.property_id::text) AS property_title,
      pt.property_type_description AS property_type,
      soc.society_english AS society,
      cit.city_english AS city,
      p.property_size,
      u.uom_english AS property_size_uom,
      COALESCE(pic.picture_url, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80') AS property_image,
      COALESCE(pd.demand_amount::text, '125,000,000') AS demand_amount,
      
      pv.request_id::text AS request_id,
      'REQ-' || LPAD(pv.request_id::text, 3, '0') AS formatted_request_id,
      pp.purpose_description AS request_purpose,

      pv.visitor_customer_id::text AS visitor_customer_id,
      cu.user_id::text AS user_id,
      TRIM(CONCAT_WS(' ', cu.customer_first_name, cu.customer_middle_name, cu.customer_last_name)) AS customer_name,
      cu.mobile AS customer_mobile,
      cu.email AS customer_email,

      pv.visit_conducted_employee_id::text AS visit_conducted_employee_id,
      COALESCE(TRIM(CONCAT_WS(' ', emp.first_name, emp.middle_name, emp.last_name)), 'Unassigned') AS employee_name,
      COALESCE(des.designation_english, 'Field Operations Officer') AS employee_designation,
      emp.reference_mobile AS employee_mobile,

      TO_CHAR(pv.visit_scheduled_date, 'YYYY-MM-DD') AS visit_scheduled_date,
      TO_CHAR(pv.visit_scheduled_time, 'HH12:MI AM') AS visit_scheduled_time,
      TO_CHAR(pv.visit_actual_date, 'YYYY-MM-DD') AS visit_actual_date,
      TO_CHAR(pv.visit_actual_time, 'HH12:MI AM') AS visit_actual_time,

      CASE
        WHEN pv.is_active = false THEN 'Cancelled'
        WHEN pv.visit_actual_date IS NOT NULL THEN 'Completed'
        WHEN pv.visit_scheduled_date < CURRENT_DATE THEN 'Overdue'
        ELSE 'Scheduled'
      END AS status,

      pv.visitor_remarks,
      pv.visit_conducted_employee_remarks AS employee_remarks,
      pv.creation_date_time AS created_at,
      TRIM(CONCAT_WS(' ', u_creator.user_first_name, u_creator.user_last_name)) AS created_by_name
    FROM property_visits pv
    JOIN properties p ON pv.property_id = p.property_id
    JOIN customers cu ON pv.visitor_customer_id = cu.customer_id
    LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
    LEFT JOIN areas a ON p.area_id = a.area_id
    LEFT JOIN societies soc ON a.society_id = soc.society_id
    LEFT JOIN cities cit ON soc.city_id = cit.city_id
    LEFT JOIN uom u ON p.property_size_uom = u.uom_id
    LEFT JOIN property_demand pd ON p.property_id = pd.property_id AND pd.is_active = true
    LEFT JOIN customer_requests cr ON pv.request_id = cr.request_id
    LEFT JOIN property_purposes pp ON cr.request_purpose_id = pp.purpose_id
    LEFT JOIN employees emp ON pv.visit_conducted_employee_id = emp.employee_id
    LEFT JOIN designations des ON emp.designation_id = des.designation_id
    LEFT JOIN users u_creator ON pv.created_by_user = u_creator.user_id
    LEFT JOIN LATERAL (
      SELECT picture_url
      FROM property_pictures
      WHERE property_id = p.property_id AND is_active = true
      ORDER BY display_order ASC, property_picture_id ASC
      LIMIT 1
    ) pic ON true
    WHERE pv.visit_id = $1;
  `;

  const { rows } = await pool.query(query, [visitId]);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Retrieves lookups for scheduling a new visit (active properties, customers, employees).
 */
const getAdminVisitOptions = async () => {
  const propertiesQuery = `
    SELECT 
      p.property_id::text AS id,
      'PRP-' || LPAD(p.property_id::text, 3, '0') AS formatted_id,
      COALESCE(p.property_description, 'Property #' || p.property_id::text) AS title,
      COALESCE(soc.society_english, 'Location N/A') AS location,
      COALESCE(cit.city_english, '') AS city,
      COALESCE(pt.property_type_description, 'Property') AS property_type
    FROM properties p
    LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
    LEFT JOIN areas a ON p.area_id = a.area_id
    LEFT JOIN societies soc ON a.society_id = soc.society_id
    LEFT JOIN cities cit ON soc.city_id = cit.city_id
    WHERE p.is_active = true
    ORDER BY p.property_id DESC;
  `;

  const customersQuery = `
    SELECT 
      c.customer_id::text AS id,
      TRIM(CONCAT_WS(' ', c.customer_first_name, c.customer_middle_name, c.customer_last_name)) AS name,
      c.mobile,
      c.email
    FROM customers c
    WHERE c.is_active = true
    ORDER BY c.customer_id DESC;
  `;

  const employeesQuery = `
    SELECT 
      e.employee_id::text AS id,
      TRIM(CONCAT_WS(' ', e.first_name, e.middle_name, e.last_name)) AS name,
      COALESCE(des.designation_english, 'Field Operations Officer') AS designation,
      e.reference_mobile AS mobile
    FROM employees e
    LEFT JOIN designations des ON e.designation_id = des.designation_id
    WHERE e.is_active = true
    ORDER BY e.employee_id ASC;
  `;

  const [propsResult, custsResult, empsResult] = await Promise.all([
    pool.query(propertiesQuery),
    pool.query(customersQuery),
    pool.query(employeesQuery),
  ]);

  return {
    properties: propsResult.rows,
    customers: custsResult.rows,
    employees: empsResult.rows,
  };
};

/**
 * Creates and schedules a new property visit.
 * Auto-links or creates a customer request to ensure integrity with foreign keys.
 */
const createAdminVisit = async (payload, adminUserId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      propertyId,
      customerId,
      employeeId,
      scheduledDate,
      scheduledTime,
      notes,
      requestId,
    } = payload;

    let targetRequestId = requestId ? parseInt(requestId, 10) : null;

    if (!targetRequestId) {
      // Find latest active request for customer & property
      const findReqQuery = `
        SELECT request_id 
        FROM customer_requests 
        WHERE customer_id = $1 AND property_id = $2 AND is_active = true
        ORDER BY request_id DESC 
        LIMIT 1;
      `;
      const existingReq = await client.query(findReqQuery, [customerId, propertyId]);

      if (existingReq.rows.length > 0) {
        targetRequestId = existingReq.rows[0].request_id;
      } else {
        // Auto-create customer request for coordination
        const createReqQuery = `
          INSERT INTO customer_requests (
            customer_id,
            property_id,
            request_description,
            created_by_user,
            is_active
          ) VALUES ($1, $2, $3, $4, true)
          RETURNING request_id;
        `;
        const desc = notes && notes.trim() !== '' 
          ? `Visit coordination: ${notes.trim()}` 
          : 'Property visit appointment scheduled by admin';
        const newReq = await client.query(createReqQuery, [customerId, propertyId, desc, adminUserId || null]);
        targetRequestId = newReq.rows[0].request_id;
      }
    }

    const insertVisitQuery = `
      INSERT INTO property_visits (
        property_id,
        visitor_customer_id,
        visit_conducted_employee_id,
        request_id,
        visit_scheduled_date,
        visit_scheduled_time,
        visit_conducted_employee_remarks,
        created_by_user,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6::time, $7, $8, true)
      RETURNING visit_id;
    `;

    const empId = employeeId ? parseInt(employeeId, 10) : null;
    const insertRes = await client.query(insertVisitQuery, [
      propertyId,
      customerId,
      empId,
      targetRequestId,
      scheduledDate,
      scheduledTime || '11:00 AM',
      notes || null,
      adminUserId || null,
    ]);

    await client.query('COMMIT');

    const newVisitId = insertRes.rows[0].visit_id;
    return await getAdminVisitById(newVisitId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Reschedules an existing property visit.
 */
const rescheduleAdminVisit = async (visitId, { newDate, newTime, reason }) => {
  const query = `
    UPDATE property_visits
    SET 
      visit_scheduled_date = $1,
      visit_scheduled_time = $2::time,
      visit_conducted_employee_remarks = CASE 
        WHEN $3::text IS NOT NULL AND $3::text <> '' 
        THEN COALESCE(visit_conducted_employee_remarks, '') || E'\n[Rescheduled: ' || $3 || E']'
        ELSE visit_conducted_employee_remarks
      END,
      update_date_time = CURRENT_TIMESTAMP
    WHERE visit_id = $4 AND is_active = true
    RETURNING visit_id;
  `;

  const { rows } = await pool.query(query, [
    newDate,
    newTime || '11:00 AM',
    reason || 'Rescheduled by admin',
    visitId,
  ]);

  if (rows.length === 0) return null;
  return await getAdminVisitById(visitId);
};

/**
 * Records completion of a property visit.
 */
const completeAdminVisit = async (visitId, { actualDate, actualTime, remarks }) => {
  const query = `
    UPDATE property_visits
    SET 
      visit_actual_date = $1,
      visit_actual_time = $2::time,
      visit_conducted_employee_remarks = CASE
        WHEN $3::text IS NOT NULL AND $3::text <> ''
        THEN $3
        ELSE COALESCE(visit_conducted_employee_remarks, 'Visit conducted and completed.')
      END,
      update_date_time = CURRENT_TIMESTAMP
    WHERE visit_id = $4 AND is_active = true
    RETURNING visit_id;
  `;

  const { rows } = await pool.query(query, [
    actualDate || new Date().toISOString().split('T')[0],
    actualTime || '11:30 AM',
    remarks || null,
    visitId,
  ]);

  if (rows.length === 0) return null;
  return await getAdminVisitById(visitId);
};

/**
 * Cancels a property visit.
 */
const cancelAdminVisit = async (visitId, { reason }) => {
  const query = `
    UPDATE property_visits
    SET 
      is_active = false,
      visit_conducted_employee_remarks = CASE
        WHEN $1::text IS NOT NULL AND $1::text <> ''
        THEN COALESCE(visit_conducted_employee_remarks, '') || E'\n[Cancelled: ' || $1 || E']'
        ELSE visit_conducted_employee_remarks
      END,
      update_date_time = CURRENT_TIMESTAMP
    WHERE visit_id = $2
    RETURNING visit_id;
  `;

  const { rows } = await pool.query(query, [reason || 'Cancelled by admin', visitId]);
  if (rows.length === 0) return null;
  return await getAdminVisitById(visitId);
};

/**
 * Updates PPC Representative findings/remarks for a visit.
 */
const updateAdminVisitRemarks = async (visitId, { remarks }) => {
  const query = `
    UPDATE property_visits
    SET 
      visit_conducted_employee_remarks = $1,
      update_date_time = CURRENT_TIMESTAMP
    WHERE visit_id = $2
    RETURNING visit_id;
  `;

  const { rows } = await pool.query(query, [remarks || null, visitId]);
  if (rows.length === 0) return null;
  return await getAdminVisitById(visitId);
};

module.exports = {
  getAdminVisitStats,
  getAdminVisits,
  getAdminVisitById,
  getAdminVisitOptions,
  createAdminVisit,
  rescheduleAdminVisit,
  completeAdminVisit,
  cancelAdminVisit,
  updateAdminVisitRemarks,
};
