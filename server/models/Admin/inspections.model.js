const { pool } = require('../../config/db');

/**
 * Retrieves global summary statistics for Property Inspections.
 */
const getAdminInspectionStats = async () => {
  const query = `
    SELECT
      COUNT(*)::text AS total,
      COUNT(*) FILTER (
        WHERE pis.inspection_actual_date IS NOT NULL 
          AND NOT EXISTS (
            SELECT 1 FROM property_inspected_details pid 
            WHERE pid.inspected_schedule_id = pis.inspection_schedule_id 
              AND pid.inspection_checklist_status_id = 2
          )
      )::text AS verified,
      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM property_inspected_details pid 
          WHERE pid.inspected_schedule_id = pis.inspection_schedule_id 
            AND pid.inspection_checklist_status_id = 2
        )
      )::text AS flagged,
      COUNT(*) FILTER (WHERE pis.inspection_actual_date IS NULL)::text AS scheduled
    FROM property_inspection_schedule pis
    WHERE pis.is_active = true;
  `;

  const { rows } = await pool.query(query);
  const r = rows[0] || {};

  return {
    total: parseInt(r.total || '0', 10),
    verified: parseInt(r.verified || '0', 10),
    flagged: parseInt(r.flagged || '0', 10),
    scheduled: parseInt(r.scheduled || '0', 10),
  };
};

/**
 * Retrieves a paginated list of property inspection reports with search and status filtering.
 */
const getAdminInspections = async ({ search, status, page = 1, limit = 10 } = {}) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const offset = (parsedPage - 1) * parsedLimit;

  const whereConditions = ['pis.is_active = true'];
  const params = [];

  // Filter: Status
  if (status && status !== 'all') {
    const s = status.trim().toLowerCase();
    if (s === 'verified') {
      whereConditions.push(`pis.inspection_actual_date IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM property_inspected_details pid 
        WHERE pid.inspected_schedule_id = pis.inspection_schedule_id AND pid.inspection_checklist_status_id = 2
      )`);
    } else if (s === 'issues flagged' || s === 'flagged') {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM property_inspected_details pid 
        WHERE pid.inspected_schedule_id = pis.inspection_schedule_id AND pid.inspection_checklist_status_id = 2
      )`);
    } else if (s === 'scheduled') {
      whereConditions.push(`pis.inspection_actual_date IS NULL`);
    } else if (s === 'in progress') {
      whereConditions.push(`pis.inspection_actual_date IS NOT NULL AND EXISTS (
        SELECT 1 FROM property_inspected_details pid 
        WHERE pid.inspected_schedule_id = pis.inspection_schedule_id AND pid.inspection_checklist_status_id = 3
      )`);
    }
  }

  // Filter: Search query
  if (search && search.trim() !== '') {
    const searchParam = `%${search.trim()}%`;
    const searchIdx = params.length + 1;
    params.push(searchParam);

    const idChecks = [];
    const num = parseInt(search.trim().replace(/\D/g, ''), 10);
    if (!isNaN(num)) {
      const idx = params.length + 1;
      params.push(num);
      idChecks.push(`pis.inspection_schedule_id = $${idx}`);
      idChecks.push(`pis.property_id = $${idx}`);
    }

    const orClauses = [
      `p.property_description ILIKE $${searchIdx}`,
      `soc.society_english ILIKE $${searchIdx}`,
      `cit.city_english ILIKE $${searchIdx}`,
      `cust.customer_first_name ILIKE $${searchIdx}`,
      `cust.customer_last_name ILIKE $${searchIdx}`,
      `cust.mobile ILIKE $${searchIdx}`,
      `emp.first_name ILIKE $${searchIdx}`,
      `emp.last_name ILIKE $${searchIdx}`,
      `pis.inspection_findings ILIKE $${searchIdx}`,
      ...idChecks
    ];

    whereConditions.push(`(${orClauses.join(' OR ')})`);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Count Query
  const countQuery = `
    SELECT COUNT(*)::text AS total
    FROM property_inspection_schedule pis
    JOIN properties p ON pis.property_id = p.property_id
    JOIN customers cust ON p.customer_id = cust.customer_id
    LEFT JOIN areas a ON p.area_id = a.area_id
    LEFT JOIN societies soc ON a.society_id = soc.society_id
    LEFT JOIN cities cit ON soc.city_id = cit.city_id
    LEFT JOIN employees emp ON pis.inspection_employee_id = emp.employee_id
    ${whereClause};
  `;

  const countRes = await pool.query(countQuery, params);
  const total = parseInt(countRes.rows[0]?.total || '0', 10);

  // Data Query
  const dataParams = [...params];
  const limitIdx = dataParams.length + 1;
  dataParams.push(parsedLimit);
  const offsetIdx = dataParams.length + 1;
  dataParams.push(offset);

  const dataQuery = `
    SELECT
      pis.inspection_schedule_id::text AS id,
      'INS-' || LPAD(pis.inspection_schedule_id::text, 3, '0') AS formatted_id,
      pis.property_id::text AS property_id,
      'PRP-' || LPAD(pis.property_id::text, 3, '0') AS formatted_property_id,
      COALESCE(p.property_description, 'Property #' || pis.property_id::text) AS property_title,
      COALESCE(pt.property_type_description, 'Residential House') AS property_type,
      COALESCE(soc.society_english, 'Location N/A') AS society,
      COALESCE(cit.city_english, '') AS city,
      p.property_size,
      u.uom_english AS property_size_uom,
      COALESCE(pic.picture_url, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80') AS property_image,
      pd.demand_amount::text AS demand_amount,

      cust.customer_id::text AS customer_id,
      TRIM(CONCAT_WS(' ', cust.customer_first_name, cust.customer_middle_name, cust.customer_last_name)) AS customer_name,
      cust.mobile AS customer_mobile,
      cust.email AS customer_email,

      pis.inspection_employee_id::text AS inspection_employee_id,
      COALESCE(TRIM(CONCAT_WS(' ', emp.first_name, emp.middle_name, emp.last_name)), 'Unassigned') AS employee_name,
      COALESCE(des.designation_english, 'Field Operations Officer') AS employee_designation,
      emp.reference_mobile AS employee_mobile,

      TO_CHAR(pis.creation_date_time, 'YYYY-MM-DD') AS inspection_scheduled_date,
      TO_CHAR(pis.creation_date_time, 'HH12:MI AM') AS inspection_scheduled_time,
      TO_CHAR(pis.inspection_actual_date, 'YYYY-MM-DD') AS inspection_actual_date,
      TO_CHAR(pis.inspection_actual_time, 'HH12:MI AM') AS inspection_actual_time,

      CASE
        WHEN pis.is_active = false THEN 'Cancelled'
        WHEN pis.inspection_actual_date IS NULL THEN 'Scheduled'
        WHEN EXISTS (
          SELECT 1 FROM property_inspected_details pid 
          WHERE pid.inspected_schedule_id = pis.inspection_schedule_id AND pid.inspection_checklist_status_id = 2
        ) THEN 'Issues Flagged'
        WHEN EXISTS (
          SELECT 1 FROM property_inspected_details pid 
          WHERE pid.inspected_schedule_id = pis.inspection_schedule_id AND pid.inspection_checklist_status_id = 3
        ) THEN 'In Progress'
        ELSE 'Verified'
      END AS status,

      pis.inspection_findings,
      pis.inspection_remarks,
      pis.gps_coordinates,
      pis.creation_date_time AS created_at
    FROM property_inspection_schedule pis
    JOIN properties p ON pis.property_id = p.property_id
    JOIN customers cust ON p.customer_id = cust.customer_id
    LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
    LEFT JOIN areas a ON p.area_id = a.area_id
    LEFT JOIN societies soc ON a.society_id = soc.society_id
    LEFT JOIN cities cit ON soc.city_id = cit.city_id
    LEFT JOIN uom u ON p.property_size_uom = u.uom_id
    LEFT JOIN property_demand pd ON p.property_id = pd.property_id AND pd.is_active = true
    LEFT JOIN employees emp ON pis.inspection_employee_id = emp.employee_id
    LEFT JOIN designations des ON emp.designation_id = des.designation_id
    LEFT JOIN LATERAL (
      SELECT picture_url
      FROM property_pictures
      WHERE property_id = p.property_id AND is_active = true
      ORDER BY display_order ASC, property_picture_id ASC
      LIMIT 1
    ) pic ON true
    ${whereClause}
    ORDER BY pis.inspection_schedule_id DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx};
  `;

  const dataRes = await pool.query(dataQuery, dataParams);

  // Fetch checklist items for each inspection
  const inspectionIds = dataRes.rows.map((r) => r.id);
  let checklistMap = {};

  if (inspectionIds.length > 0) {
    const checklistQuery = `
      SELECT
        pid.inspected_detail_id::text AS id,
        pid.inspected_schedule_id::text AS schedule_id,
        pid.inspected_checklist_id::text AS checklist_id,
        ics.inspection_checklist_status_id AS status_id,
        ics.status_description AS status_label,
        ics.status_urdu,
        pid.inspected_checklist_remarks AS remarks
      FROM property_inspected_details pid
      JOIN inspection_checklist_statuses ics ON pid.inspection_checklist_status_id = ics.inspection_checklist_status_id
      WHERE pid.inspected_schedule_id = ANY($1) AND pid.is_active = true
      ORDER BY pid.inspected_detail_id ASC;
    `;
    const clRes = await pool.query(checklistQuery, [inspectionIds]);
    clRes.rows.forEach((item) => {
      if (!checklistMap[item.schedule_id]) {
        checklistMap[item.schedule_id] = [];
      }
      checklistMap[item.schedule_id].push(item);
    });
  }

  const rowsWithChecklists = dataRes.rows.map((r) => ({
    ...r,
    checklist: checklistMap[r.id] || []
  }));

  return {
    rows: rowsWithChecklists,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1,
    },
  };
};

/**
 * Retrieves full 360-degree inspection report details by ID.
 */
const getAdminInspectionById = async (inspectionId) => {
  const query = `
    SELECT
      pis.inspection_schedule_id::text AS id,
      'INS-' || LPAD(pis.inspection_schedule_id::text, 3, '0') AS formatted_id,
      pis.property_id::text AS property_id,
      'PRP-' || LPAD(pis.property_id::text, 3, '0') AS formatted_property_id,
      COALESCE(p.property_description, 'Property #' || pis.property_id::text) AS property_title,
      COALESCE(pt.property_type_description, 'Residential House') AS property_type,
      COALESCE(soc.society_english, 'Location N/A') AS society,
      COALESCE(cit.city_english, '') AS city,
      p.property_size,
      u.uom_english AS property_size_uom,
      COALESCE(pic.picture_url, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80') AS property_image,
      pd.demand_amount::text AS demand_amount,

      cust.customer_id::text AS customer_id,
      cust.user_id::text AS user_id,
      TRIM(CONCAT_WS(' ', cust.customer_first_name, cust.customer_middle_name, cust.customer_last_name)) AS customer_name,
      cust.mobile AS customer_mobile,
      cust.email AS customer_email,

      pis.inspection_employee_id::text AS inspection_employee_id,
      COALESCE(TRIM(CONCAT_WS(' ', emp.first_name, emp.middle_name, emp.last_name)), 'Unassigned') AS employee_name,
      COALESCE(des.designation_english, 'Field Operations Officer') AS employee_designation,
      emp.reference_mobile AS employee_mobile,

      TO_CHAR(pis.creation_date_time, 'YYYY-MM-DD') AS inspection_scheduled_date,
      TO_CHAR(pis.creation_date_time, 'HH12:MI AM') AS inspection_scheduled_time,
      TO_CHAR(pis.inspection_actual_date, 'YYYY-MM-DD') AS inspection_actual_date,
      TO_CHAR(pis.inspection_actual_time, 'HH12:MI AM') AS inspection_actual_time,

      CASE
        WHEN pis.is_active = false THEN 'Cancelled'
        WHEN pis.inspection_actual_date IS NULL THEN 'Scheduled'
        WHEN EXISTS (
          SELECT 1 FROM property_inspected_details pid 
          WHERE pid.inspected_schedule_id = pis.inspection_schedule_id AND pid.inspection_checklist_status_id = 2
        ) THEN 'Issues Flagged'
        WHEN EXISTS (
          SELECT 1 FROM property_inspected_details pid 
          WHERE pid.inspected_schedule_id = pis.inspection_schedule_id AND pid.inspection_checklist_status_id = 3
        ) THEN 'In Progress'
        ELSE 'Verified'
      END AS status,

      pis.inspection_findings,
      pis.inspection_remarks,
      pis.gps_coordinates,
      pis.creation_date_time AS created_at
    FROM property_inspection_schedule pis
    JOIN properties p ON pis.property_id = p.property_id
    JOIN customers cust ON p.customer_id = cust.customer_id
    LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
    LEFT JOIN areas a ON p.area_id = a.area_id
    LEFT JOIN societies soc ON a.society_id = soc.society_id
    LEFT JOIN cities cit ON soc.city_id = cit.city_id
    LEFT JOIN uom u ON p.property_size_uom = u.uom_id
    LEFT JOIN property_demand pd ON p.property_id = pd.property_id AND pd.is_active = true
    LEFT JOIN employees emp ON pis.inspection_employee_id = emp.employee_id
    LEFT JOIN designations des ON emp.designation_id = des.designation_id
    LEFT JOIN LATERAL (
      SELECT picture_url
      FROM property_pictures
      WHERE property_id = p.property_id AND is_active = true
      ORDER BY display_order ASC, property_picture_id ASC
      LIMIT 1
    ) pic ON true
    WHERE pis.inspection_schedule_id = $1 AND pis.is_active = true;
  `;

  const { rows } = await pool.query(query, [inspectionId]);
  if (rows.length === 0) return null;

  const inspection = rows[0];

  // Fetch checklist items
  const checklistQuery = `
    SELECT
      pid.inspected_detail_id::text AS id,
      pid.inspected_checklist_id::text AS checklist_id,
      ics.inspection_checklist_status_id AS status_id,
      ics.status_description AS status_label,
      ics.status_urdu,
      pid.inspected_checklist_remarks AS remarks,
      CASE
        WHEN pid.inspected_checklist_id = 1 THEN 'Structural & Civil Works'
        WHEN pid.inspected_checklist_id = 2 THEN 'Electrical & Power Systems'
        WHEN pid.inspected_checklist_id = 3 THEN 'Plumbing, Water & Drainage'
        WHEN pid.inspected_checklist_id = 4 THEN 'Roofing, Bitumen & Weathering'
        ELSE 'Compliance & Utility NOCs'
      END AS category,
      CASE
        WHEN pid.inspected_checklist_id = 1 THEN 'Foundation, Beams & Columns'
        WHEN pid.inspected_checklist_id = 2 THEN 'Main DB Box, Circuit Breakers & Earthing'
        WHEN pid.inspected_checklist_id = 3 THEN 'PPR-C Piping & Water Pressure'
        WHEN pid.inspected_checklist_id = 4 THEN 'Rooftop Bitumen & Water Drainage'
        ELSE 'CDA/RDA Building Plan & Sewerage NOC'
      END AS item_title
    FROM property_inspected_details pid
    JOIN inspection_checklist_statuses ics ON pid.inspection_checklist_status_id = ics.inspection_checklist_status_id
    WHERE pid.inspected_schedule_id = $1 AND pid.is_active = true
    ORDER BY pid.inspected_detail_id ASC;
  `;

  const clRes = await pool.query(checklistQuery, [inspectionId]);
  inspection.checklist = clRes.rows;

  return inspection;
};

/**
 * Updates inspection findings/remarks directly.
 */
const updateAdminInspectionFindings = async (inspectionId, { findings, remarks }) => {
  const query = `
    UPDATE property_inspection_schedule
    SET
      inspection_findings = COALESCE($1, inspection_findings),
      inspection_remarks = COALESCE($2, inspection_remarks),
      update_date_time = CURRENT_TIMESTAMP
    WHERE inspection_schedule_id = $3 AND is_active = true
    RETURNING inspection_schedule_id;
  `;

  const { rows } = await pool.query(query, [findings || null, remarks || null, inspectionId]);
  if (rows.length === 0) return null;
  return await getAdminInspectionById(inspectionId);
};

/**
 * Updates an individual checklist item (status and/or remarks).
 */
const updateAdminInspectionChecklistItem = async (scheduleId, detailId, { status_id, remarks }) => {
  const updates = [];
  const params = [];

  if (status_id !== undefined && status_id !== null) {
    params.push(parseInt(status_id, 10));
    updates.push(`inspection_checklist_status_id = $${params.length}`);
  }

  if (remarks !== undefined && remarks !== null) {
    params.push(remarks.trim());
    updates.push(`inspected_checklist_remarks = $${params.length}`);
  }

  updates.push(`update_date_time = CURRENT_TIMESTAMP`);

  if (updates.length === 1) {
    return null;
  }

  params.push(detailId);
  const detailIdIdx = params.length;

  params.push(scheduleId);
  const scheduleIdIdx = params.length;

  const updateQuery = `
    UPDATE property_inspected_details
    SET ${updates.join(', ')}
    WHERE inspected_detail_id = $${detailIdIdx}
      AND inspected_schedule_id = $${scheduleIdIdx}
      AND is_active = true
    RETURNING inspected_detail_id;
  `;

  const { rows } = await pool.query(updateQuery, params);
  if (rows.length === 0) return null;

  const fetchQuery = `
    SELECT
      pid.inspected_detail_id::text AS id,
      pid.inspected_schedule_id::text AS schedule_id,
      pid.inspected_checklist_id::text AS checklist_id,
      ics.inspection_checklist_status_id AS status_id,
      ics.status_description AS status_label,
      ics.status_urdu,
      pid.inspected_checklist_remarks AS remarks,
      CASE
        WHEN pid.inspected_checklist_id = 1 THEN 'Structural & Civil Works'
        WHEN pid.inspected_checklist_id = 2 THEN 'Electrical & Power Systems'
        WHEN pid.inspected_checklist_id = 3 THEN 'Plumbing, Water & Drainage'
        WHEN pid.inspected_checklist_id = 4 THEN 'Roofing, Bitumen & Weathering'
        ELSE 'Compliance & Utility NOCs'
      END AS category,
      CASE
        WHEN pid.inspected_checklist_id = 1 THEN 'Foundation, Beams & Columns'
        WHEN pid.inspected_checklist_id = 2 THEN 'Main DB Box, Circuit Breakers & Earthing'
        WHEN pid.inspected_checklist_id = 3 THEN 'PPR-C Piping & Water Pressure'
        WHEN pid.inspected_checklist_id = 4 THEN 'Rooftop Bitumen & Water Drainage'
        ELSE 'CDA/RDA Building Plan & Sewerage NOC'
      END AS item_title
    FROM property_inspected_details pid
    JOIN inspection_checklist_statuses ics ON pid.inspection_checklist_status_id = ics.inspection_checklist_status_id
    WHERE pid.inspected_detail_id = $1 AND pid.is_active = true;
  `;

  const itemRes = await pool.query(fetchQuery, [detailId]);
  return itemRes.rows[0] || null;
};

/**
 * Retrieves dropdown options (active properties and field inspectors).
 */
const getAdminInspectionOptions = async () => {
  const propertiesQuery = `
    SELECT 
      p.property_id::text AS id,
      'PRP-' || LPAD(p.property_id::text, 3, '0') AS formatted_id,
      COALESCE(p.property_description, 'Property #' || p.property_id::text) AS title,
      COALESCE(soc.society_english, 'Location N/A') AS location,
      COALESCE(cit.city_english, '') AS city,
      COALESCE(pt.property_type_description, 'Residential House') AS property_type
    FROM properties p
    LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
    LEFT JOIN areas a ON p.area_id = a.area_id
    LEFT JOIN societies soc ON a.society_id = soc.society_id
    LEFT JOIN cities cit ON soc.city_id = cit.city_id
    WHERE p.is_active = true
    ORDER BY p.property_id DESC;
  `;

  const inspectorsQuery = `
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

  const [propsResult, empsResult] = await Promise.all([
    pool.query(propertiesQuery),
    pool.query(inspectorsQuery),
  ]);

  return {
    properties: propsResult.rows,
    inspectors: empsResult.rows,
  };
};

/**
 * Creates and schedules a new property inspection with standard initial checklist items.
 */
const createAdminInspection = async (payload, adminUserId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      propertyId,
      inspectorId,
      scheduledDate,
      scheduledTime,
      scopeNotes,
    } = payload;

    // Combine date and time for creation_date_time (or default to current timestamp)
    let scheduledTimestamp = new Date();
    if (scheduledDate) {
      try {
        const timePart = scheduledTime || '11:00 AM';
        const parsed = new Date(`${scheduledDate} ${timePart}`);
        if (!isNaN(parsed.getTime())) {
          scheduledTimestamp = parsed;
        }
      } catch {
        scheduledTimestamp = new Date();
      }
    }

    const insertScheduleQuery = `
      INSERT INTO property_inspection_schedule (
        property_id,
        inspection_employee_id,
        creation_date_time,
        update_date_time,
        inspection_actual_date,
        inspection_actual_time,
        inspection_findings,
        inspection_remarks,
        created_by_user,
        is_active,
        gps_coordinates
      ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, NULL, NULL, $4, $5, $6, true, '33.7294° N, 73.0551° E')
      RETURNING inspection_schedule_id;
    `;

    const findingsText = scopeNotes && scopeNotes.trim() !== ''
      ? scopeNotes.trim()
      : 'Comprehensive multi-point structural and utility audit scheduled.';

    const scheduleRes = await client.query(insertScheduleQuery, [
      parseInt(propertyId, 10),
      parseInt(inspectorId, 10),
      scheduledTimestamp,
      findingsText,
      'Scheduled by Super Admin for on-site physical survey and checklist verification.',
      adminUserId ? parseInt(adminUserId, 10) : null,
    ]);

    const newScheduleId = scheduleRes.rows[0].inspection_schedule_id;

    // Auto-create initial 5 standard engineering checklist items in property_inspected_details
    const initialChecklist = [
      { id: 1, remarks: 'Inspection queued for foundation, columns, and structural survey.' },
      { id: 2, remarks: 'Inspection queued for main DB box, earthing, and electrical check.' },
      { id: 3, remarks: 'Inspection queued for plumbing, pressure, and leakage testing.' },
      { id: 4, remarks: 'Inspection queued for rooftop waterproofing and weathering audit.' },
      { id: 5, remarks: 'Inspection queued for utility NOCs and municipal compliance check.' },
    ];

    const insertItemQuery = `
      INSERT INTO property_inspected_details (
        inspected_schedule_id,
        inspected_checklist_id,
        inspection_checklist_status_id,
        inspected_checklist_remarks,
        inspected_by_employee_id,
        creation_date_time,
        update_date_time,
        created_by_user,
        is_active
      ) VALUES ($1, $2, 4, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $5, true);
    `;

    for (const item of initialChecklist) {
      await client.query(insertItemQuery, [
        newScheduleId,
        item.id,
        item.remarks,
        parseInt(inspectorId, 10),
        adminUserId ? parseInt(adminUserId, 10) : null,
      ]);
    }

    await client.query('COMMIT');
    return await getAdminInspectionById(newScheduleId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getAdminInspectionStats,
  getAdminInspections,
  getAdminInspectionById,
  updateAdminInspectionFindings,
  updateAdminInspectionChecklistItem,
  getAdminInspectionOptions,
  createAdminInspection,
};
