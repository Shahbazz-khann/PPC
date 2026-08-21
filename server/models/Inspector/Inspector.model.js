const { pool } = require('../../config/db');

const getDashboardSummary = async (inspectorId) => {
    const query = `
        SELECT
            COUNT(DISTINCT i.inspection_id) AS assigned_inspections,
            COUNT(DISTINCT CASE WHEN stat.name = 'Pending' THEN i.inspection_id END) AS pending_inspections,
            COUNT(DISTINCT CASE WHEN stat.name = 'In Progress' THEN i.inspection_id END) AS in_progress,
            COUNT(DISTINCT CASE WHEN stat.name = 'Completed' THEN i.inspection_id END) AS completed,
            COUNT(DISTINCT ir.inspection_report_id) AS reports_submitted
        FROM inspections i
        LEFT JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        LEFT JOIN inspection_reports ir ON i.inspection_id = ir.inspection_id
        WHERE i.inspector_id = $1
    `;
    const { rows } = await pool.query(query, [inspectorId]);
    
    return {
        assigned_inspections: parseInt(rows[0].assigned_inspections, 10) || 0,
        pending_inspections: parseInt(rows[0].pending_inspections, 10) || 0,
        in_progress: parseInt(rows[0].in_progress, 10) || 0,
        completed: parseInt(rows[0].completed, 10) || 0,
        reports_submitted: parseInt(rows[0].reports_submitted, 10) || 0
    };
};

const getInspectionOverview = async (inspectorId) => {
    const query = `
        SELECT
            COUNT(DISTINCT CASE WHEN stat.name = 'Pending' THEN i.inspection_id END) AS pending,
            COUNT(DISTINCT CASE WHEN stat.name = 'In Progress' THEN i.inspection_id END) AS in_progress,
            COUNT(DISTINCT CASE WHEN stat.name = 'Completed' THEN i.inspection_id END) AS completed,
            COUNT(DISTINCT i.inspection_id) AS total
        FROM inspections i
        LEFT JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        WHERE i.inspector_id = $1
    `;
    const { rows } = await pool.query(query, [inspectorId]);
    
    return {
        pending: parseInt(rows[0].pending, 10) || 0,
        in_progress: parseInt(rows[0].in_progress, 10) || 0,
        completed: parseInt(rows[0].completed, 10) || 0,
        total: parseInt(rows[0].total, 10) || 0
    };
};

const getUpcomingSchedules = async (inspectorId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const query = `
        SELECT
            i.inspection_id,
            i.property_id,
            p.title AS property_title,
            p.address,
            p.city,
            i.scheduled_at,
            stat.name AS inspection_status,
            pv.customer_id,
            u.name AS customer_name,
            pm.media_url AS primary_property_image
        FROM inspections i
        JOIN properties p ON i.property_id = p.property_id
        JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        LEFT JOIN property_visits pv ON pv.property_id = i.property_id AND pv.scheduled_at = i.scheduled_at
        LEFT JOIN users u ON pv.customer_id = u.user_id
        LEFT JOIN property_media pm ON pm.property_id = p.property_id AND pm.is_primary = true
        WHERE i.inspector_id = $1
          AND i.scheduled_at > NOW()
          AND stat.name IN ('Scheduled', 'Confirmed', 'Rescheduled')
        ORDER BY i.scheduled_at ASC
        LIMIT $2 OFFSET $3
    `;

    const { rows } = await pool.query(query, [inspectorId, limit, offset]);
    return rows;
};

const getRecentInspections = async (inspectorId) => {
    const query = `
        SELECT
            i.inspection_id,
            i.property_id,
            p.title AS property_title,
            p.address,
            p.city,
            i.completed_at,
            stat.name AS inspection_status,
            pm.media_url AS primary_property_image
        FROM inspections i
        JOIN properties p ON i.property_id = p.property_id
        JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        LEFT JOIN property_media pm ON pm.property_id = p.property_id AND pm.is_primary = true
        WHERE i.inspector_id = $1
          AND stat.name = 'Completed'
        ORDER BY i.completed_at DESC
        LIMIT 5
    `;

    const { rows } = await pool.query(query, [inspectorId]);
    return rows;
};

const getStatusTrend = async (inspectorId, period = 'month') => {
    let dateFilter = '';
    let truncLevel = 'day';
    
    if (period === 'week') {
        dateFilter = `AND event_date >= NOW() - INTERVAL '7 days'`;
        truncLevel = 'day';
    } else if (period === 'month') {
        dateFilter = `AND event_date >= NOW() - INTERVAL '30 days'`;
        truncLevel = 'day';
    } else if (period === 'all time' || period === 'all_time') {
        dateFilter = '';
        truncLevel = 'month';
    }

    const query = `
        WITH raw_events AS (
            SELECT 
                created_at AS event_date,
                'assigned' AS event_type,
                inspection_id
            FROM inspections
            WHERE inspector_id = $1
            
            UNION ALL
            
            SELECT 
                completed_at AS event_date,
                'completed' AS event_type,
                i.inspection_id
            FROM inspections i
            JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
            WHERE i.inspector_id = $1 AND stat.name = 'Completed' AND i.completed_at IS NOT NULL
            
            UNION ALL
            
            SELECT 
                scheduled_at AS event_date,
                'pending' AS event_type,
                i.inspection_id
            FROM inspections i
            JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
            WHERE i.inspector_id = $1 AND stat.name = 'Pending' AND i.scheduled_at IS NOT NULL
        )
        SELECT 
            TO_CHAR(DATE_TRUNC('${truncLevel}', event_date), 'YYYY-MM-DD') AS date,
            COUNT(DISTINCT CASE WHEN event_type = 'assigned' THEN inspection_id END) AS assigned,
            COUNT(DISTINCT CASE WHEN event_type = 'completed' THEN inspection_id END) AS completed,
            COUNT(DISTINCT CASE WHEN event_type = 'pending' THEN inspection_id END) AS pending
        FROM raw_events
        WHERE event_date IS NOT NULL ${dateFilter}
        GROUP BY DATE_TRUNC('${truncLevel}', event_date)
        ORDER BY DATE_TRUNC('${truncLevel}', event_date) ASC
    `;

    const { rows } = await pool.query(query, [inspectorId]);
    return rows.map(row => ({
        date: row.date,
        assigned: parseInt(row.assigned, 10) || 0,
        completed: parseInt(row.completed, 10) || 0,
        pending: parseInt(row.pending, 10) || 0,
    }));
};

const getInspectionsPageSummary = async (inspectorId) => {
    const query = `
        SELECT
            COUNT(DISTINCT i.inspection_id) AS total_inspections,
            COUNT(DISTINCT CASE WHEN stat.name = 'Pending' THEN i.inspection_id END) AS pending,
            COUNT(DISTINCT CASE WHEN stat.name = 'In Progress' THEN i.inspection_id END) AS in_progress,
            COUNT(DISTINCT CASE WHEN stat.name = 'Completed' THEN i.inspection_id END) AS completed,
            COUNT(DISTINCT CASE WHEN stat.name = 'Cancelled' THEN i.inspection_id END) AS cancelled
        FROM inspections i
        LEFT JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        WHERE i.inspector_id = $1
    `;
    const { rows } = await pool.query(query, [inspectorId]);
    
    return {
        total_inspections: parseInt(rows[0].total_inspections, 10) || 0,
        pending: parseInt(rows[0].pending, 10) || 0,
        in_progress: parseInt(rows[0].in_progress, 10) || 0,
        completed: parseInt(rows[0].completed, 10) || 0,
        cancelled: parseInt(rows[0].cancelled, 10) || 0
    };
};

const getInspectionsList = async (inspectorId, params = {}) => {
    const { status, search, area, date, page = 1, limit = 10, sort } = params;
    
    let queryArgs = [inspectorId];
    let whereClauses = ['i.inspector_id = $1'];
    let argCount = 1;
    
    if (status) {
        argCount++;
        whereClauses.push(`stat.name = $${argCount}`);
        queryArgs.push(status);
    }
    
    if (search) {
        argCount++;
        whereClauses.push(`(p.title ILIKE $${argCount} OR p.address ILIKE $${argCount} OR p.city ILIKE $${argCount} OR u.name ILIKE $${argCount})`);
        queryArgs.push(`%${search}%`);
    }
    
    if (area) {
        argCount++;
        whereClauses.push(`(p.city ILIKE $${argCount} OR p.address ILIKE $${argCount})`);
        queryArgs.push(`%${area}%`);
    }
    
    if (date) {
        argCount++;
        whereClauses.push(`DATE(i.scheduled_at) = $${argCount}`);
        queryArgs.push(date);
    }
    
    const whereString = whereClauses.join(' AND ');
    
    let orderBy = 'i.scheduled_at DESC';
    if (sort === 'oldest') {
        orderBy = 'i.scheduled_at ASC';
    } else if (sort === 'newest') {
        orderBy = 'i.scheduled_at DESC';
    } else if (sort === 'status') {
        orderBy = 'stat.name ASC';
    }
    
    const countQuery = `
        SELECT COUNT(DISTINCT i.inspection_id) AS total
        FROM inspections i
        JOIN properties p ON i.property_id = p.property_id
        JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        LEFT JOIN users u ON p.owner_id = u.user_id
        WHERE ${whereString}
    `;
    const countResult = await pool.query(countQuery, queryArgs);
    const total = parseInt(countResult.rows[0].total, 10) || 0;
    
    const offset = (page - 1) * limit;
    const limitIndex = argCount + 1;
    const offsetIndex = argCount + 2;
    queryArgs.push(limit, offset);
    
    const dataQuery = `
        SELECT
            i.inspection_id,
            i.property_id,
            p.title AS property_title,
            p.address AS property_address,
            p.city AS property_city,
            u.name AS owner_name,
            u.mobile_no AS owner_mobile_no,
            i.scheduled_at,
            stat.name AS inspection_status,
            NULL AS priority,
            pm.media_url AS primary_property_image
        FROM inspections i
        JOIN properties p ON i.property_id = p.property_id
        JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        LEFT JOIN users u ON p.owner_id = u.user_id
        LEFT JOIN property_media pm ON pm.property_id = p.property_id AND pm.is_primary = true
        WHERE ${whereString}
        ORDER BY ${orderBy}
        LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `;
    
    const { rows } = await pool.query(dataQuery, queryArgs);
    
    return {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit),
        data: rows
    };
};

const getInspectionDetails = async (inspectorId, inspectionId) => {
    const query = `
        SELECT
            i.inspection_id,
            i.property_id,
            p.title AS property_title,
            p.address AS property_address,
            p.city AS property_city,
            pm.media_url AS primary_property_image,
            stat.name AS inspection_status,
            NULL AS priority,
            u.name AS owner_name,
            u.mobile_no AS owner_contact,
            TO_CHAR(i.scheduled_at, 'YYYY-MM-DD') AS scheduled_date,
            TO_CHAR(i.scheduled_at, 'HH24:MI') AS scheduled_time,
            i.notes AS inspector_notes,
            NULL AS audit_items
        FROM inspections i
        JOIN properties p ON i.property_id = p.property_id
        JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        LEFT JOIN users u ON p.owner_id = u.user_id
        LEFT JOIN property_media pm ON pm.property_id = p.property_id AND pm.is_primary = true
        WHERE i.inspection_id = $1 AND i.inspector_id = $2
    `;
    
    const { rows } = await pool.query(query, [inspectionId, inspectorId]);
    return rows[0] || null;
};

const updateInspection = async (inspectorId, inspectionId, updateData) => {
    const { inspection_status_id, notes } = updateData;
    
    const checkQuery = `
        SELECT inspection_id 
        FROM inspections 
        WHERE inspection_id = $1 AND inspector_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [inspectionId, inspectorId]);
    
    if (checkResult.rows.length === 0) {
        return null;
    }
    
    let updates = [];
    let values = [];
    let argCount = 1;
    
    if (inspection_status_id !== undefined) {
        const statusCheck = await pool.query('SELECT 1 FROM inspection_statuses WHERE inspection_status_id = $1', [inspection_status_id]);
        if (statusCheck.rows.length === 0) {
            throw new Error('Invalid inspection_status_id');
        }
        
        updates.push(`inspection_status_id = $${argCount}`);
        values.push(inspection_status_id);
        argCount++;
        
        if (parseInt(inspection_status_id, 10) === 4) {
            updates.push(`completed_at = NOW()`);
        } else {
            updates.push(`completed_at = NULL`);
        }
    }
    
    if (notes !== undefined) {
        updates.push(`notes = $${argCount}`);
        values.push(notes);
        argCount++;
    }
    
    if (updates.length === 0) {
        const currentQuery = 'SELECT * FROM inspections WHERE inspection_id = $1';
        const res = await pool.query(currentQuery, [inspectionId]);
        return res.rows[0];
    }
    
    updates.push(`updated_at = NOW()`);
    
    const updateQuery = `
        UPDATE inspections
        SET ${updates.join(', ')}
        WHERE inspection_id = $${argCount} AND inspector_id = $${argCount + 1}
        RETURNING *
    `;
    values.push(inspectionId, inspectorId);
    
    const { rows } = await pool.query(updateQuery, values);
    return rows[0] || null;
};

const getSchedulesSummary = async (inspectorId) => {
    const query = `
        SELECT
            COUNT(DISTINCT CASE WHEN DATE(i.scheduled_at) = CURRENT_DATE THEN i.inspection_id END) AS today_count,
            COUNT(DISTINCT CASE WHEN DATE_TRUNC('week', i.scheduled_at) = DATE_TRUNC('week', CURRENT_DATE) THEN i.inspection_id END) AS this_week_count,
            COUNT(DISTINCT CASE WHEN i.scheduled_at > NOW() AND stat.name IN ('Pending', 'Scheduled', 'Rescheduled') THEN i.inspection_id END) AS upcoming_count,
            COUNT(DISTINCT CASE WHEN stat.name = 'Completed' AND DATE_TRUNC('week', i.completed_at) = DATE_TRUNC('week', CURRENT_DATE) THEN i.inspection_id END) AS completed_this_week
        FROM inspections i
        JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        WHERE i.inspector_id = $1
    `;
    const { rows } = await pool.query(query, [inspectorId]);
    
    return {
        today_count: parseInt(rows[0].today_count, 10) || 0,
        this_week_count: parseInt(rows[0].this_week_count, 10) || 0,
        upcoming_count: parseInt(rows[0].upcoming_count, 10) || 0,
        completed_this_week: parseInt(rows[0].completed_this_week, 10) || 0
    };
};

const getSchedulesList = async (inspectorId, params = {}) => {
    const { start_date, end_date, search, area, status, page = 1, limit = 10, sort } = params;
    
    let queryArgs = [inspectorId];
    let whereClauses = ['i.inspector_id = $1'];
    let argCount = 1;
    
    if (search) {
        argCount++;
        whereClauses.push(`(p.title ILIKE $${argCount} OR p.address ILIKE $${argCount} OR p.city ILIKE $${argCount} OR u.name ILIKE $${argCount})`);
        queryArgs.push(`%${search}%`);
    }
    
    if (area) {
        argCount++;
        whereClauses.push(`(p.city ILIKE $${argCount} OR p.address ILIKE $${argCount})`);
        queryArgs.push(`%${area}%`);
    }
    
    if (status) {
        argCount++;
        whereClauses.push(`stat.name ILIKE $${argCount}`);
        queryArgs.push(`%${status}%`);
    }
    
    if (start_date) {
        argCount++;
        whereClauses.push(`DATE(i.scheduled_at) >= $${argCount}`);
        queryArgs.push(start_date);
    }
    
    if (end_date) {
        argCount++;
        whereClauses.push(`DATE(i.scheduled_at) <= $${argCount}`);
        queryArgs.push(end_date);
    }
    
    const whereString = whereClauses.join(' AND ');
    
    let orderBy = 'i.scheduled_at ASC';
    if (sort === 'oldest') orderBy = 'i.scheduled_at ASC';
    else if (sort === 'newest') orderBy = 'i.scheduled_at DESC';
    
    const countQuery = `
        SELECT COUNT(DISTINCT i.inspection_id) AS total
        FROM inspections i
        JOIN properties p ON i.property_id = p.property_id
        JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        LEFT JOIN users u ON p.owner_id = u.user_id
        WHERE ${whereString}
    `;
    
    const countRes = await pool.query(countQuery, queryArgs);
    const total = parseInt(countRes.rows[0].total, 10) || 0;
    
    const offset = (page - 1) * limit;
    const limitIndex = argCount + 1;
    const offsetIndex = argCount + 2;
    queryArgs.push(limit, offset);
    
    const dataQuery = `
        SELECT DISTINCT
            i.inspection_id,
            i.property_id,
            p.title AS property_title,
            pm.media_url AS primary_property_image,
            p.address AS property_address,
            p.city AS property_city,
            u.name AS customer_name,
            u.mobile_no AS customer_mobile_no,
            i.scheduled_at,
            stat.name AS inspection_status
        FROM inspections i
        JOIN properties p ON i.property_id = p.property_id
        JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        LEFT JOIN users u ON p.owner_id = u.user_id
        LEFT JOIN property_media pm ON pm.property_id = p.property_id AND pm.is_primary = true
        WHERE ${whereString}
        ORDER BY ${orderBy}
        LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `;
    
    const { rows } = await pool.query(dataQuery, queryArgs);
    
    return {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit) || 0,
        data: rows
    };
};

const getScheduleDetails = async (inspectorId, inspectionId) => {
    const query = `
        SELECT 
            i.inspection_id,
            i.property_id,
            p.title AS property_title,
            pm.media_url AS primary_property_image,
            p.address AS property_address,
            p.city AS property_city,
            cu.name AS customer_name,
            cu.mobile_no AS customer_mobile_no,
            ou.name AS owner_name,
            ou.mobile_no AS owner_mobile_no,
            i.scheduled_at,
            stat.name AS inspection_status,
            NULL AS priority,
            i.notes
        FROM inspections i
        JOIN properties p ON i.property_id = p.property_id
        JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        LEFT JOIN property_visits pv ON pv.property_id = i.property_id AND pv.scheduled_at = i.scheduled_at
        LEFT JOIN users cu ON pv.customer_id = cu.user_id
        LEFT JOIN users ou ON p.owner_id = ou.user_id
        LEFT JOIN property_media pm ON pm.property_id = p.property_id AND pm.is_primary = true
        WHERE i.inspection_id = $1 AND i.inspector_id = $2
        LIMIT 1
    `;
    
    const { rows } = await pool.query(query, [inspectionId, inspectorId]);
    return rows.length > 0 ? rows[0] : null;
};

const startInspection = async (inspectorId, inspectionId, notes) => {
    // 1. Get current inspection status and verify ownership
    const checkQuery = `
        SELECT i.inspection_id, stat.name AS status_name
        FROM inspections i
        JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        WHERE i.inspection_id = $1 AND i.inspector_id = $2
    `;
    const checkRes = await pool.query(checkQuery, [inspectionId, inspectorId]);
    
    if (checkRes.rows.length === 0) {
        return { notFound: true };
    }
    
    const currentStatus = checkRes.rows[0].status_name;
    if (currentStatus === 'In Progress' || currentStatus === 'Completed') {
        return { invalidState: true, currentStatus };
    }
    
    // 2. Get ID for 'In Progress' status
    const statQuery = `SELECT inspection_status_id FROM inspection_statuses WHERE name = 'In Progress'`;
    const statRes = await pool.query(statQuery);
    if (statRes.rows.length === 0) {
        throw new Error("Status 'In Progress' not found in lookup table");
    }
    const inProgressId = statRes.rows[0].inspection_status_id;
    
    // 3. Update the inspection
    const updateQuery = `
        UPDATE inspections
        SET inspection_status_id = $1, notes = COALESCE($2, notes), updated_at = NOW()
        WHERE inspection_id = $3 AND inspector_id = $4
        RETURNING *
    `;
    
    const updateRes = await pool.query(updateQuery, [inProgressId, notes || null, inspectionId, inspectorId]);
    return { success: true, data: updateRes.rows[0] };
};

const getReportsOverview = async (inspectorId) => {
    const query = `
        SELECT
            COUNT(DISTINCT ir.inspection_report_id) AS total_reports,
            COUNT(DISTINCT CASE WHEN ir.reported_at IS NULL THEN ir.inspection_report_id END) AS draft_reports,
            COUNT(DISTINCT CASE WHEN ir.reported_at IS NOT NULL THEN ir.inspection_report_id END) AS submitted_reports
        FROM inspection_reports ir
        JOIN inspections i ON ir.inspection_id = i.inspection_id
        WHERE i.inspector_id = $1
    `;
    
    const { rows } = await pool.query(query, [inspectorId]);
    
    return {
        total_reports: parseInt(rows[0].total_reports, 10) || 0,
        draft_reports: parseInt(rows[0].draft_reports, 10) || 0,
        submitted_reports: parseInt(rows[0].submitted_reports, 10) || 0,
        approved_reports: 0,
        revisions_requested: 0
    };
};

const getReportIssuesSummary = async (inspectorId) => {
    // According to the DB schema, there are no dedicated issue/category tables for reports.
    // Findings are stored as plain text. Return empty array as per requirement if no records exist.
    return [];
};

const getRecentReportActivity = async (inspectorId) => {
    const query = `
        WITH report_events AS (
            SELECT 
                'report_created' AS activity_type,
                'Report Created' AS title,
                'A new inspection report was drafted for property: ' || COALESCE(p.title, 'Unknown') AS description,
                ir.inspection_report_id AS report_id,
                ir.inspection_report_id::text AS report_identifier,
                ir.created_at AS timestamp
            FROM inspection_reports ir
            JOIN inspections i ON ir.inspection_id = i.inspection_id
            JOIN properties p ON i.property_id = p.property_id
            WHERE i.inspector_id = $1
        
            UNION ALL
        
            SELECT 
                'report_submitted' AS activity_type,
                'Report Submitted' AS title,
                'The inspection report was successfully submitted for property: ' || COALESCE(p.title, 'Unknown') AS description,
                ir.inspection_report_id AS report_id,
                ir.inspection_report_id::text AS report_identifier,
                ir.reported_at AS timestamp
            FROM inspection_reports ir
            JOIN inspections i ON ir.inspection_id = i.inspection_id
            JOIN properties p ON i.property_id = p.property_id
            WHERE i.inspector_id = $1 AND ir.reported_at IS NOT NULL
        )
        SELECT * FROM report_events
        ORDER BY timestamp DESC
        LIMIT 5;
    `;
    
    const { rows } = await pool.query(query, [inspectorId]);
    return rows;
};

const getReportsSummary = async (inspectorId) => {
    const query = `
        SELECT
            COUNT(DISTINCT ir.inspection_report_id) AS total_reports
        FROM inspection_reports ir
        JOIN inspections i ON ir.inspection_id = i.inspection_id
        WHERE i.inspector_id = $1
    `;
    
    const { rows } = await pool.query(query, [inspectorId]);
    
    return {
        total_reports: parseInt(rows[0].total_reports, 10) || 0,
        draft_reports: 0, // No report status column/table exists in the actual schema
        submitted_reports: 0,
        approved_reports: 0,
        revisions_requested: 0
    };
};

const getReportsList = async (inspectorId, params = {}) => {
    const { search, status, area, start_date, end_date, page = 1, limit = 10, sort } = params;
    
    let queryArgs = [inspectorId];
    let whereClauses = ['i.inspector_id = $1'];
    let argCount = 1;
    
    if (search) {
        argCount++;
        whereClauses.push(`(p.title ILIKE $${argCount} OR p.address ILIKE $${argCount} OR p.city ILIKE $${argCount} OR ir.inspection_report_id::text ILIKE $${argCount})`);
        queryArgs.push(`%${search}%`);
    }
    
    // As established, no report status column/table exists in the DB.
    // We will safely ignore the status filter so the list still populates,
    // or you could uncomment the next line to force an empty result if a status is demanded:
    // if (status) { whereClauses.push(`1 = 0`); }
    
    if (area) {
        argCount++;
        whereClauses.push(`(p.city ILIKE $${argCount} OR p.address ILIKE $${argCount})`);
        queryArgs.push(`%${area}%`);
    }
    
    if (start_date) {
        argCount++;
        whereClauses.push(`DATE(ir.reported_at) >= $${argCount}`);
        queryArgs.push(start_date);
    }
    
    if (end_date) {
        argCount++;
        whereClauses.push(`DATE(ir.reported_at) <= $${argCount}`);
        queryArgs.push(end_date);
    }
    
    const whereString = whereClauses.join(' AND ');
    
    let orderBy = 'ir.reported_at DESC';
    if (sort === 'oldest') {
        orderBy = 'ir.reported_at ASC';
    } else if (sort === 'newest') {
        orderBy = 'ir.reported_at DESC';
    }
    
    const countQuery = `
        SELECT COUNT(DISTINCT ir.inspection_report_id) AS total
        FROM inspection_reports ir
        JOIN inspections i ON ir.inspection_id = i.inspection_id
        JOIN properties p ON i.property_id = p.property_id
        WHERE ${whereString}
    `;
    const countResult = await pool.query(countQuery, queryArgs);
    const total = parseInt(countResult.rows[0].total, 10) || 0;
    
    const offset = (page - 1) * limit;
    const limitIndex = argCount + 1;
    const offsetIndex = argCount + 2;
    queryArgs.push(limit, offset);
    
    const dataQuery = `
        SELECT
            ir.inspection_report_id,
            ir.inspection_id,
            i.property_id,
            p.title AS property_title,
            p.address AS property_address,
            p.city AS property_city,
            pm.media_url AS primary_property_image,
            TO_CHAR(i.scheduled_at, 'YYYY-MM-DD') AS inspection_date,
            TO_CHAR(ir.reported_at, 'YYYY-MM-DD') AS date_submitted,
            NULL AS report_status
        FROM inspection_reports ir
        JOIN inspections i ON ir.inspection_id = i.inspection_id
        JOIN properties p ON i.property_id = p.property_id
        LEFT JOIN property_media pm ON pm.property_id = p.property_id AND pm.is_primary = true
        WHERE ${whereString}
        ORDER BY ${orderBy}
        LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `;
    
    const { rows } = await pool.query(dataQuery, queryArgs);
    
    return {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit) || 0,
        data: rows
    };
};

const getReportDetails = async (inspectorId, reportId) => {
    const query = `
        SELECT
            p.property_id,
            p.title AS property_title,
            p.address AS property_address,
            p.city AS property_city,
            pm.media_url AS primary_property_image,
            ir.inspection_report_id,
            ir.inspection_id,
            COALESCE(i.completed_at, i.scheduled_at) AS inspection_date,
            ir.reported_at,
            NULL AS report_status,
            res.name AS inspection_result,
            ir.report_summary,
            ir.findings,
            ir.recommendations,
            ir.overall_condition
        FROM inspection_reports ir
        JOIN inspections i ON ir.inspection_id = i.inspection_id
        JOIN properties p ON i.property_id = p.property_id
        LEFT JOIN inspection_results res ON ir.inspection_result_id = res.inspection_result_id
        LEFT JOIN property_media pm ON pm.property_id = p.property_id AND pm.is_primary = true
        WHERE ir.inspection_report_id = $1 AND i.inspector_id = $2
    `;
    
    const { rows } = await pool.query(query, [reportId, inspectorId]);
    
    if (rows.length === 0) {
        return null;
    }
    
    const row = rows[0];
    
    return {
        ...row,
        audit_scores: {
            "Boundary & Land": null,
            "Structure & Walls": null,
            "Wiring & Solar": null,
            "Plumbing & Drainage": null
        }
    };
};

const createReport = async (inspectorId, reportData) => {
    const {
        inspection_id,
        report_summary,
        findings,
        recommendations,
        overall_condition
    } = reportData;
    
    // Check if inspection belongs to inspector
    const checkInspection = await pool.query(`
        SELECT inspection_id 
        FROM inspections 
        WHERE inspection_id = $1 AND inspector_id = $2
    `, [inspection_id, inspectorId]);
    
    if (checkInspection.rows.length === 0) {
        return null;
    }
    
    // Business rule: Check if report already exists for this inspection
    const checkReport = await pool.query(`
        SELECT inspection_report_id
        FROM inspection_reports
        WHERE inspection_id = $1
    `, [inspection_id]);
    
    if (checkReport.rows.length > 0) {
        return { duplicate: true };
    }
    
    // Insert new report (Note: schema does not have a report_status table/column)
    const insertQuery = `
        INSERT INTO inspection_reports (
            inspection_id,
            report_summary,
            findings,
            recommendations,
            overall_condition,
            reported_at,
            created_at,
            updated_at
        ) VALUES (
            $1, $2, $3, $4, $5, NULL, NOW(), NOW()
        )
        RETURNING *
    `;
    
    const { rows } = await pool.query(insertQuery, [
        inspection_id,
        report_summary || null,
        findings || null,
        recommendations || null,
        overall_condition || null
    ]);
    
    return rows[0];
};

const updateReport = async (inspectorId, reportId, updateData) => {
    // 1. Verify ownership and existence
    const checkQuery = `
        SELECT ir.inspection_report_id
        FROM inspection_reports ir
        JOIN inspections i ON ir.inspection_id = i.inspection_id
        WHERE ir.inspection_report_id = $1 AND i.inspector_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [reportId, inspectorId]);
    
    if (checkResult.rows.length === 0) {
        return null;
    }
    
    // 2. Build update query
    let updates = [];
    let values = [];
    let argCount = 1;
    
    const allowedFields = ['report_summary', 'findings', 'recommendations', 'overall_condition'];
    
    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            updates.push(`${field} = $${argCount}`);
            values.push(updateData[field]);
            argCount++;
        }
    }
    
    if (updates.length === 0) {
        // Return existing if no fields to update
        const currentQuery = 'SELECT * FROM inspection_reports WHERE inspection_report_id = $1';
        const res = await pool.query(currentQuery, [reportId]);
        return res.rows[0];
    }
    
    updates.push(`updated_at = NOW()`);
    
    const updateQuery = `
        UPDATE inspection_reports
        SET ${updates.join(', ')}
        WHERE inspection_report_id = $${argCount}
        RETURNING *
    `;
    values.push(reportId);
    
    const { rows } = await pool.query(updateQuery, values);
    return rows[0];
};

const submitReport = async (inspectorId, reportId) => {
    const checkQuery = `
        SELECT ir.*
        FROM inspection_reports ir
        JOIN inspections i ON ir.inspection_id = i.inspection_id
        WHERE ir.inspection_report_id = $1 AND i.inspector_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [reportId, inspectorId]);
    
    if (checkResult.rows.length === 0) {
        return null; // Not found or unauthorized
    }
    
    const report = checkResult.rows[0];
    
    if (report.reported_at !== null) {
        return { alreadySubmitted: true };
    }
    
    if (!report.report_summary || !report.findings || !report.recommendations || !report.overall_condition) {
        return { 
            validationError: true, 
            message: "Missing required fields: report_summary, findings, recommendations, and overall_condition must be provided before submission." 
        };
    }
    
    const updateQuery = `
        UPDATE inspection_reports
        SET reported_at = NOW(), updated_at = NOW()
        WHERE inspection_report_id = $1
        RETURNING *
    `;
    
    const { rows } = await pool.query(updateQuery, [reportId]);
    return rows[0];
};

const getPropertiesSummary = async (inspectorId) => {
    const summaryQuery = `
        SELECT
            COUNT(DISTINCT p.property_id) AS total_assigned_properties,
            COUNT(DISTINCT CASE WHEN stat.name = 'Pending' THEN p.property_id END) AS pending_inspection,
            COUNT(DISTINCT CASE WHEN stat.name = 'In Progress' THEN p.property_id END) AS in_progress,
            COUNT(DISTINCT CASE WHEN stat.name = 'Completed' THEN p.property_id END) AS completed
        FROM properties p
        JOIN inspections i ON p.property_id = i.property_id
        JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        WHERE i.inspector_id = $1 AND (p.is_deleted = false OR p.is_deleted IS NULL)
    `;
    const summaryRes = await pool.query(summaryQuery, [inspectorId]);
    
    const nextQuery = `
        SELECT
            i.inspection_id,
            p.property_id,
            p.title AS property_title,
            i.scheduled_at
        FROM inspections i
        JOIN properties p ON i.property_id = p.property_id
        JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        WHERE i.inspector_id = $1
          AND i.scheduled_at > NOW()
          AND stat.name IN ('Pending', 'Scheduled', 'Rescheduled')
          AND (p.is_deleted = false OR p.is_deleted IS NULL)
        ORDER BY i.scheduled_at ASC
        LIMIT 1
    `;
    const nextRes = await pool.query(nextQuery, [inspectorId]);
    
    return {
        total_assigned_properties: parseInt(summaryRes.rows[0].total_assigned_properties, 10) || 0,
        pending_inspection: parseInt(summaryRes.rows[0].pending_inspection, 10) || 0,
        in_progress: parseInt(summaryRes.rows[0].in_progress, 10) || 0,
        completed: parseInt(summaryRes.rows[0].completed, 10) || 0,
        next_inspection: nextRes.rows[0] || null
    };
};

const getPropertiesList = async (inspectorId, params = {}) => {
    const { search, area, type, status, page = 1, limit = 10, sort } = params;
    
    let queryArgs = [inspectorId];
    let whereClauses = ['(p.is_deleted = false OR p.is_deleted IS NULL)'];
    let argCount = 1;
    
    if (search) {
        argCount++;
        whereClauses.push(`(p.title ILIKE $${argCount} OR p.property_id::text ILIKE $${argCount} OR u.name ILIKE $${argCount} OR p.address ILIKE $${argCount} OR p.city ILIKE $${argCount})`);
        queryArgs.push(`%${search}%`);
    }
    if (area) {
        argCount++;
        whereClauses.push(`(p.city ILIKE $${argCount} OR p.address ILIKE $${argCount})`);
        queryArgs.push(`%${area}%`);
    }
    if (type) {
        argCount++;
        whereClauses.push(`pt.name ILIKE $${argCount}`);
        queryArgs.push(`%${type}%`);
    }
    if (status) {
        argCount++;
        whereClauses.push(`li.inspection_status ILIKE $${argCount}`);
        queryArgs.push(`%${status}%`);
    }
    
    const whereString = whereClauses.join(' AND ');
    
    let orderBy = 'nu.next_inspection ASC NULLS LAST';
    if (sort === 'oldest') orderBy = 'nu.next_inspection DESC NULLS LAST';
    if (sort === 'newest') orderBy = 'nu.next_inspection ASC NULLS LAST';
    if (sort === 'title') orderBy = 'p.title ASC';
    
    const baseQuery = `
        WITH inspector_properties AS (
            SELECT DISTINCT property_id FROM inspections WHERE inspector_id = $1
        ),
        property_inspections AS (
            SELECT 
                i.property_id,
                stat.name AS inspection_status,
                ROW_NUMBER() OVER(PARTITION BY i.property_id ORDER BY i.scheduled_at DESC) as rn
            FROM inspections i
            JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
            WHERE i.inspector_id = $1
        ),
        latest_inspection AS (
            SELECT * FROM property_inspections WHERE rn = 1
        ),
        last_completed AS (
            SELECT 
                i.property_id,
                MAX(i.completed_at) as last_inspection
            FROM inspections i
            JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
            WHERE i.inspector_id = $1 AND stat.name = 'Completed'
            GROUP BY i.property_id
        ),
        next_upcoming AS (
            SELECT 
                property_id, 
                scheduled_at as next_inspection
            FROM (
                SELECT 
                    i.property_id,
                    i.scheduled_at,
                    ROW_NUMBER() OVER(PARTITION BY i.property_id ORDER BY i.scheduled_at ASC) as rn
                FROM inspections i
                JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
                WHERE i.inspector_id = $1 AND i.scheduled_at > NOW() AND stat.name IN ('Pending', 'Scheduled', 'Rescheduled')
            ) sub
            WHERE rn = 1
        ),
        latest_verification AS (
            SELECT pv.property_id, vs.name AS verification_status
            FROM (
                SELECT property_id, verification_status_id, ROW_NUMBER() OVER(PARTITION BY property_id ORDER BY created_at DESC) as rn
                FROM property_verifications
            ) pv
            LEFT JOIN verification_statuses vs ON pv.verification_status_id = vs.verification_status_id
            WHERE pv.rn = 1
        )
    `;
    
    const countQuery = `
        ${baseQuery}
        SELECT COUNT(p.property_id) AS total
        FROM inspector_properties ip
        JOIN properties p ON ip.property_id = p.property_id
        LEFT JOIN users u ON p.owner_id = u.user_id
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN latest_inspection li ON p.property_id = li.property_id
        WHERE ${whereString}
    `;
    
    const countRes = await pool.query(countQuery, queryArgs);
    const total = parseInt(countRes.rows[0].total, 10) || 0;
    
    const offset = (page - 1) * limit;
    const limitIndex = argCount + 1;
    const offsetIndex = argCount + 2;
    queryArgs.push(limit, offset);
    
    const dataQuery = `
        ${baseQuery}
        SELECT 
            p.property_id,
            p.property_id AS property_reference,
            p.title,
            pm.media_url AS primary_image,
            u.user_id AS owner_id,
            u.name AS owner_name,
            u.mobile_no AS owner_mobile_no,
            p.address,
            p.city,
            pt.name AS property_type,
            lv.verification_status,
            li.inspection_status,
            lc.last_inspection,
            nu.next_inspection
        FROM inspector_properties ip
        JOIN properties p ON ip.property_id = p.property_id
        LEFT JOIN users u ON p.owner_id = u.user_id
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN latest_inspection li ON p.property_id = li.property_id
        LEFT JOIN last_completed lc ON p.property_id = lc.property_id
        LEFT JOIN next_upcoming nu ON p.property_id = nu.property_id
        LEFT JOIN latest_verification lv ON p.property_id = lv.property_id
        LEFT JOIN property_media pm ON p.property_id = pm.property_id AND pm.is_primary = true
        WHERE ${whereString}
        ORDER BY ${orderBy}
        LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `;
    
    const { rows } = await pool.query(dataQuery, queryArgs);
    
    return {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit) || 0,
        data: rows
    };
};

const getPropertyDetails = async (inspectorId, propertyId) => {
    // Basic property details
    const propQuery = `
        SELECT 
            p.property_id,
            p.property_id AS property_reference,
            p.title,
            p.description,
            p.address,
            p.city,
            pt.name AS property_type,
            pm.media_url AS primary_image,
            u.name AS owner_name,
            u.mobile_no AS owner_contact
        FROM properties p
        JOIN inspections i ON p.property_id = i.property_id
        LEFT JOIN users u ON p.owner_id = u.user_id
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN property_media pm ON p.property_id = pm.property_id AND pm.is_primary = true
        WHERE p.property_id = $1 AND i.inspector_id = $2 AND (p.is_deleted = false OR p.is_deleted IS NULL)
        LIMIT 1
    `;
    const propRes = await pool.query(propQuery, [propertyId, inspectorId]);
    if (propRes.rows.length === 0) return null;
    
    const details = propRes.rows[0];
    
    // PPC Verification Status
    const verifRes = await pool.query(`
        SELECT vs.name AS verification_status
        FROM property_verifications pv
        JOIN verification_statuses vs ON pv.verification_status_id = vs.verification_status_id
        WHERE pv.property_id = $1
        ORDER BY pv.created_at DESC LIMIT 1
    `, [propertyId]);
    details.ppc_verification_status = verifRes.rows[0]?.verification_status || null;
    
    // Inspection History related to this Inspector
    const historyQuery = `
        SELECT 
            i.inspection_id,
            i.scheduled_at,
            i.completed_at,
            stat.name AS inspection_status,
            i.notes
        FROM inspections i
        JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        WHERE i.property_id = $1 AND i.inspector_id = $2
        ORDER BY i.scheduled_at DESC
    `;
    const histRes = await pool.query(historyQuery, [propertyId, inspectorId]);
    
    // Last and Next
    const completed = histRes.rows.filter(h => h.inspection_status === 'Completed' && h.completed_at);
    details.last_inspection_date = completed.length > 0 ? completed[0].completed_at : null;
    
    const upcoming = histRes.rows.filter(h => 
        ['Pending', 'Scheduled', 'Rescheduled'].includes(h.inspection_status) && 
        new Date(h.scheduled_at) > new Date()
    ).sort((a,b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    details.next_scheduled_inspection = upcoming.length > 0 ? upcoming[0].scheduled_at : null;
    
    // Current status and notes (from latest relevant inspection)
    details.current_inspection_status = histRes.rows[0]?.inspection_status || null;
    details.notes = histRes.rows[0]?.notes || null;
    
    return details;
};

const getInspectorProfile = async (inspectorId) => {
    // Basic user query
    const userQuery = `
        SELECT 
            u.user_id AS inspector_id,
            u.name AS full_name,
            u.mobile_no AS phone_number,
            u.email,
            r.role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = $1
    `;
    const userRes = await pool.query(userQuery, [inspectorId]);
    if (userRes.rows.length === 0) return null;
    
    const profile = userRes.rows[0];
    
    // Stats query
    const statsQuery = `
        SELECT
            COUNT(DISTINCT i.inspection_id) AS total_assigned_inspections,
            COUNT(DISTINCT CASE WHEN stat.name = 'Completed' THEN i.inspection_id END) AS completed_inspections
        FROM inspections i
        LEFT JOIN inspection_statuses stat ON i.inspection_status_id = stat.inspection_status_id
        WHERE i.inspector_id = $1
    `;
    const statsRes = await pool.query(statsQuery, [inspectorId]);
    
    // Verified audits (submitted reports)
    const reportsQuery = `
        SELECT
            COUNT(DISTINCT ir.inspection_report_id) AS verified_audits
        FROM inspection_reports ir
        JOIN inspections i ON ir.inspection_id = i.inspection_id
        WHERE i.inspector_id = $1 AND ir.reported_at IS NOT NULL
    `;
    const reportsRes = await pool.query(reportsQuery, [inspectorId]);
    
    return {
        ...profile,
        assigned_territory: null,
        bio: null,
        specialization: null,
        total_assigned_inspections: parseInt(statsRes.rows[0]?.total_assigned_inspections, 10) || 0,
        completed_inspections: parseInt(statsRes.rows[0]?.completed_inspections, 10) || 0,
        account_status: 'Active',
        inspector_rating: null,
        verified_audits: parseInt(reportsRes.rows[0]?.verified_audits, 10) || 0
    };
};

module.exports = {
    getDashboardSummary,
    getInspectionOverview,
    getSchedulesSummary,
    getSchedulesList,
    getScheduleDetails,
    startInspection,
    getUpcomingSchedules,
    getRecentInspections,
    getStatusTrend,
    getInspectionsPageSummary,
    getInspectionsList,
    getInspectionDetails,
    updateInspection,
    getReportsOverview,
    getReportIssuesSummary,
    getRecentReportActivity,
    getReportsSummary,
    getReportsList,
    getReportDetails,
    createReport,
    updateReport,
    submitReport,
    getPropertiesSummary,
    getPropertiesList,
    getPropertyDetails,
    getInspectorProfile
};



