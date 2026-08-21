const { pool } = require('../../config/db');

/**
 * Fetch customer's nearest future upcoming visit
 * Upcoming statuses: Scheduled, Confirmed, Rescheduled
 * @param {number|string} customerId
 */
const getUpcomingVisitByCustomerId = async (customerId) => {
    const query = `
        SELECT
            pv.visit_id,
            pv.scheduled_at,
            pv.confirmed_at,
            pv.notes,
            vs.name AS status,
            
            -- Property details
            p.property_id,
            p.title AS property_title,
            p.address AS property_address,
            p.city AS property_city,
            p.sale_price AS property_sale_price,
            p.rent_price AS property_rent_price,
            p.bedrooms AS property_bedrooms,
            p.bathrooms AS property_bathrooms,
            p.area_value AS property_area_value,
            au.name AS property_area_unit,
            pt.name AS property_type,
            
            -- Primary approved image
            pm.media_url AS primary_image,
            
            -- Inspector details
            i.user_id AS inspector_id,
            i.name AS inspector_name,
            i.email AS inspector_email,
            i.mobile_no AS inspector_mobile
        FROM property_visits pv
        JOIN visit_statuses vs ON vs.visit_status_id = pv.visit_status_id
        JOIN properties p ON p.property_id = pv.property_id
        LEFT JOIN property_types pt ON pt.property_type_id = p.property_type_id
        LEFT JOIN area_units au ON au.area_unit_id = p.area_unit_id
        LEFT JOIN users i ON i.user_id = pv.inspector_id
        LEFT JOIN property_media pm
            ON pm.property_id = p.property_id
           AND pm.media_type_id = 1
           AND pm.media_status_id = 3
           AND pm.is_primary = TRUE
           AND pm.is_deleted = FALSE
        WHERE pv.customer_id = $1
          AND LOWER(vs.name) IN ('scheduled', 'confirmed', 'rescheduled')
          AND pv.scheduled_at >= NOW()
        ORDER BY pv.scheduled_at ASC
        LIMIT 1;
    `;

    const result = await pool.query(query, [customerId]);
    const row = result.rows[0];

    if (!row) {
        return null;
    }

    const locationStr = [row.property_address, row.property_city].filter(Boolean).join(', ');

    const inspectorObj = row.inspector_id ? {
        inspector_id: row.inspector_id,
        name: row.inspector_name,
        email: row.inspector_email,
        mobile_no: row.inspector_mobile
    } : null;

    return {
        visit_id: row.visit_id,
        status: row.status,
        scheduled_at: row.scheduled_at,
        confirmed_at: row.confirmed_at,
        notes: row.notes,
        
        // Convenience top-level fields for direct rendering in UI components
        title: row.property_title || null,
        location: locationStr || null,
        image: row.primary_image || null,
        primary_image: row.primary_image || null,
        primary_approved_image: row.primary_image || null,
        inspector_name: row.inspector_name || null,

        // Structured objects
        property: {
            property_id: row.property_id,
            title: row.property_title,
            address: row.property_address,
            city: row.property_city,
            sale_price: row.property_sale_price,
            rent_price: row.property_rent_price,
            bedrooms: row.property_bedrooms,
            bathrooms: row.property_bathrooms,
            area_value: row.property_area_value,
            area_unit: row.property_area_unit,
            property_type: row.property_type
        },

        inspector: inspectorObj,
        inspector_details: inspectorObj
    };
};

/**
 * Fetch customer's recent activity (latest 5)
 * @param {number|string} customerId
 */
const getRecentActivitiesByCustomerId = async (customerId) => {
    const query = `
        WITH combined_activities AS (
            -- 1. Confirmed / Rescheduled Property Visits
            SELECT 
                'visit_' || pv.visit_id::text AS activity_id,
                'visit' AS type,
                CASE 
                    WHEN LOWER(vs.name) = 'confirmed' THEN 'Property visit confirmed'
                    WHEN LOWER(vs.name) = 'rescheduled' THEN 'Property visit rescheduled'
                    ELSE 'Property visit ' || LOWER(vs.name)
                END AS text,
                vs.name AS status,
                COALESCE(pv.confirmed_at, pv.updated_at, pv.created_at) AS event_date,
                pv.property_id,
                p.title AS property_title
            FROM property_visits pv
            JOIN visit_statuses vs ON vs.visit_status_id = pv.visit_status_id
            LEFT JOIN properties p ON p.property_id = pv.property_id
            WHERE pv.customer_id = $1
              AND LOWER(vs.name) IN ('confirmed', 'rescheduled')

            UNION ALL

            -- 2. Property Requests
            SELECT 
                'request_' || pr.request_id::text AS activity_id,
                'request' AS type,
                'Property request ' || LOWER(COALESCE(prs.name, 'submitted')) AS text,
                COALESCE(prs.name, 'Submitted') AS status,
                COALESCE(pr.requested_at, pr.created_at) AS event_date,
                pr.property_id,
                p.title AS property_title
            FROM property_requests pr
            LEFT JOIN property_request_statuses prs ON prs.request_status_id = pr.request_status_id
            LEFT JOIN properties p ON p.property_id = pr.property_id
            WHERE pr.customer_id = $1

            UNION ALL

            -- 3. Transactions
            SELECT 
                'transaction_' || t.transaction_id::text AS activity_id,
                'transaction' AS type,
                'Transaction ' || LOWER(COALESCE(ts.name, 'initiated')) AS text,
                COALESCE(ts.name, 'Initiated') AS status,
                COALESCE(t.transaction_date, t.created_at) AS event_date,
                t.property_id,
                p.title AS property_title
            FROM transactions t
            LEFT JOIN transaction_statuses ts ON ts.transaction_status_id = t.transaction_status_id
            LEFT JOIN properties p ON p.property_id = t.property_id
            WHERE t.customer_id = $1

            UNION ALL

            -- 4. Invoices Generated
            SELECT 
                'invoice_' || inv.invoice_id::text AS activity_id,
                'invoice' AS type,
                'Invoice generated' AS text,
                COALESCE(ins.name, 'Issued') AS status,
                COALESCE(inv.issued_at, inv.created_at) AS event_date,
                t.property_id,
                p.title AS property_title
            FROM invoices inv
            JOIN commission_records cr ON cr.commission_id = inv.commission_id
            LEFT JOIN invoice_statuses ins ON ins.invoice_status_id = inv.invoice_status_id
            LEFT JOIN transactions t ON t.transaction_id = cr.transaction_id
            LEFT JOIN properties p ON p.property_id = t.property_id
            WHERE cr.payer_id = $1 OR t.customer_id = $1

            UNION ALL

            -- 5. Inspection Reports (valid relationship via property visits or transactions)
            SELECT DISTINCT ON (ir.inspection_report_id)
                'inspection_' || ir.inspection_report_id::text AS activity_id,
                'inspection_report' AS type,
                'Inspection report available' AS text,
                'Available' AS status,
                COALESCE(ir.reported_at, ir.created_at) AS event_date,
                ins.property_id,
                p.title AS property_title
            FROM inspection_reports ir
            JOIN inspections ins ON ins.inspection_id = ir.inspection_id
            LEFT JOIN properties p ON p.property_id = ins.property_id
            WHERE EXISTS (
                SELECT 1 FROM property_visits pv 
                WHERE pv.property_id = ins.property_id AND pv.customer_id = $1
            ) OR EXISTS (
                SELECT 1 FROM transactions t 
                WHERE t.property_id = ins.property_id AND t.customer_id = $1
            )
        )
        SELECT 
            activity_id,
            type,
            text,
            status,
            event_date AS timestamp,
            property_id,
            property_title
        FROM combined_activities
        WHERE event_date IS NOT NULL
        ORDER BY event_date DESC
        LIMIT 5;
    `;

    const result = await pool.query(query, [customerId]);
    return result.rows;
};

/**
 * Fetch customer's visits list with filters, pagination and summary stats
 * @param {number|string} customerId
 * @param {Object} filters - { tab, status, page, limit }
 */
const getCustomerVisits = async (customerId, filters = {}) => {
    const {
        tab,
        status,
        page = 1,
        limit = 10
    } = filters;

    // 1. Summary Counts for Customer
    const summaryQuery = `
        SELECT
            COUNT(*) FILTER (
                WHERE LOWER(vs.name) IN ('scheduled', 'confirmed', 'rescheduled')
                  AND (pv.scheduled_at IS NULL OR pv.scheduled_at >= NOW())
            ) AS upcoming_count,
            COUNT(*) FILTER (
                WHERE LOWER(vs.name) = 'completed'
            ) AS completed_count,
            COUNT(*) FILTER (
                WHERE LOWER(vs.name) = 'pending'
            ) AS pending_count,
            COUNT(*) AS total_count
        FROM property_visits pv
        JOIN visit_statuses vs ON vs.visit_status_id = pv.visit_status_id
        WHERE pv.customer_id = $1;
    `;

    const summaryResult = await pool.query(summaryQuery, [customerId]);
    const summary = summaryResult.rows[0] || {};

    const summaryData = {
        upcoming_count: parseInt(summary.upcoming_count, 10) || 0,
        completed_count: parseInt(summary.completed_count, 10) || 0,
        pending_count: parseInt(summary.pending_count, 10) || 0,
        total_count: parseInt(summary.total_count, 10) || 0,
        average_rating: null // Ratings are not stored in database schema
    };

    // 2. Build Where Conditions for List
    const whereConditions = [`pv.customer_id = $1`];
    const queryParams = [customerId];
    let paramIndex = 2;

    // Tab filter (upcoming / past / completed / pending)
    if (tab) {
        const lowerTab = tab.toLowerCase().trim();
        if (lowerTab === 'upcoming') {
            whereConditions.push(`LOWER(vs.name) IN ('scheduled', 'confirmed', 'rescheduled')`);
            whereConditions.push(`(pv.scheduled_at IS NULL OR pv.scheduled_at >= NOW())`);
        } else if (lowerTab === 'past' || lowerTab === 'completed') {
            whereConditions.push(`(LOWER(vs.name) IN ('completed', 'cancelled', 'no show') OR pv.scheduled_at < NOW())`);
        } else if (lowerTab === 'pending') {
            whereConditions.push(`LOWER(vs.name) = 'pending'`);
        }
    }

    // Specific Status filter
    if (status && status.trim()) {
        if (!isNaN(status)) {
            whereConditions.push(`pv.visit_status_id = $${paramIndex}`);
            queryParams.push(parseInt(status, 10));
            paramIndex++;
        } else {
            whereConditions.push(`LOWER(vs.name) = LOWER($${paramIndex})`);
            queryParams.push(status.trim());
            paramIndex++;
        }
    }

    const whereClause = whereConditions.join(' AND ');

    // 3. Count Query for Pagination
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM property_visits pv
        JOIN visit_statuses vs ON vs.visit_status_id = pv.visit_status_id
        WHERE ${whereClause};
    `;

    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total, 10) || 0;

    // 4. Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    // 5. Main Visits Query
    const mainQuery = `
        SELECT
            pv.visit_id,
            pv.scheduled_at,
            pv.confirmed_at,
            pv.completed_at,
            pv.notes,
            vs.name AS status,
            vs.visit_status_id,
            
            -- Property details
            p.property_id,
            p.title AS property_title,
            p.address AS property_address,
            p.city AS property_city,
            pt.name AS property_type,
            
            -- Primary approved image
            pm.media_url AS primary_image,
            
            -- Inspector details
            i.user_id AS inspector_id,
            i.name AS inspector_name,
            i.email AS inspector_email,
            i.mobile_no AS inspector_mobile
        FROM property_visits pv
        JOIN visit_statuses vs ON vs.visit_status_id = pv.visit_status_id
        JOIN properties p ON p.property_id = pv.property_id
        LEFT JOIN property_types pt ON pt.property_type_id = p.property_type_id
        LEFT JOIN users i ON i.user_id = pv.inspector_id
        LEFT JOIN property_media pm
            ON pm.property_id = p.property_id
           AND pm.media_type_id = 1
           AND pm.media_status_id = 3
           AND pm.is_primary = TRUE
           AND pm.is_deleted = FALSE
        WHERE ${whereClause}
        ORDER BY COALESCE(pv.scheduled_at, pv.created_at) DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    const mainResult = await pool.query(mainQuery, [...queryParams, limitNum, offset]);

    const formattedVisits = mainResult.rows.map(row => {
        const locationStr = [row.property_address, row.property_city].filter(Boolean).join(', ');
        
        const inspectorObj = row.inspector_id ? {
            inspector_id: row.inspector_id,
            name: row.inspector_name,
            email: row.inspector_email,
            mobile_no: row.inspector_mobile
        } : null;

        return {
            visit_id: row.visit_id,
            status: row.status,
            visit_status_id: row.visit_status_id,
            scheduled_at: row.scheduled_at,
            confirmed_at: row.confirmed_at,
            completed_at: row.completed_at,
            notes: row.notes,
            
            // Convenience flat properties
            title: row.property_title || null,
            location: locationStr || null,
            image: row.primary_image || null,
            primary_image: row.primary_image || null,
            primary_approved_image: row.primary_image || null,
            inspector_name: row.inspector_name || null,

            // Nested structured objects
            property: {
                property_id: row.property_id,
                title: row.property_title,
                address: row.property_address,
                city: row.property_city,
                property_type: row.property_type
            },

            inspector: inspectorObj,
            inspector_details: inspectorObj
        };
    });

    return {
        summary: summaryData,
        visits: formattedVisits,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            total_pages: Math.ceil(total / limitNum) || 1
        }
    };
};

// get Transaction Summary 


const getTransactionSummary = async (customerId) => {
    const query = `
        SELECT
            COUNT(*) AS total_transactions,

            COUNT(*) FILTER (
                WHERE LOWER(ts.name) = 'in progress'
            ) AS active_transactions,

            COUNT(*) FILTER (
                WHERE LOWER(ts.name) = 'completed'
            ) AS completed_transactions,

            COUNT(*) FILTER (
                WHERE LOWER(ts.name) = 'pending'
            ) AS pending_transactions

        FROM transactions t
        JOIN transaction_statuses ts
            ON ts.transaction_status_id = t.transaction_status_id

        WHERE t.customer_id = $1;
    `;

    const result = await pool.query(query, [customerId]);

    return result.rows[0];
};
/**
 * Fetch customer's transactions list with filters and pagination
 * @param {number|string} customerId
 * @param {Object} filters - { search, status, transaction_type, sort, page, limit }
 */
const getCustomerTransactions = async (customerId, filters = {}) => {
    const {
        search,
        status,
        transaction_type,
        sort,
        page = 1,
        limit = 10
    } = filters;

    const whereConditions = [`t.customer_id = $1`];
    const queryParams = [customerId];
    let paramIndex = 2;

    // Search filter
    if (search && search.trim()) {
        whereConditions.push(`(p.title ILIKE $${paramIndex} OR p.address ILIKE $${paramIndex} OR p.city ILIKE $${paramIndex})`);
        queryParams.push(`%${search.trim()}%`);
        paramIndex++;
    }

    // Status filter
    if (status && status.trim()) {
        if (!isNaN(status)) {
            whereConditions.push(`t.transaction_status_id = $${paramIndex}`);
            queryParams.push(parseInt(status, 10));
            paramIndex++;
        } else {
            whereConditions.push(`LOWER(ts.name) = LOWER($${paramIndex})`);
            queryParams.push(status.trim());
            paramIndex++;
        }
    }

    // Transaction type filter
    if (transaction_type && transaction_type.trim()) {
        if (!isNaN(transaction_type)) {
            whereConditions.push(`t.transaction_type_id = $${paramIndex}`);
            queryParams.push(parseInt(transaction_type, 10));
            paramIndex++;
        } else {
            whereConditions.push(`LOWER(tt.name) = LOWER($${paramIndex})`);
            queryParams.push(transaction_type.trim());
            paramIndex++;
        }
    }

    const whereClause = whereConditions.join(' AND ');

    // Sorting
    let orderBy = 't.transaction_date DESC NULLS LAST, t.created_at DESC';
    if (sort) {
        if (sort === 'oldest') {
            orderBy = 't.transaction_date ASC NULLS LAST, t.created_at ASC';
        } else if (sort === 'amount_high') {
            orderBy = 't.agreed_amount DESC NULLS LAST, t.created_at DESC';
        } else if (sort === 'amount_low') {
            orderBy = 't.agreed_amount ASC NULLS LAST, t.created_at DESC';
        }
    }

    // Count Query for Pagination
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM transactions t
        LEFT JOIN properties p ON p.property_id = t.property_id
        LEFT JOIN transaction_statuses ts ON ts.transaction_status_id = t.transaction_status_id
        LEFT JOIN transaction_types tt ON tt.transaction_type_id = t.transaction_type_id
        WHERE ${whereClause};
    `;

    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total, 10) || 0;

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    // Main Query
    const mainQuery = `
        SELECT
            t.transaction_id,
            t.property_id,
            p.title AS property_title,
            p.address,
            p.city,
            tt.name AS transaction_type,
            ts.name AS transaction_status,
            t.agreed_amount,
            t.transaction_date,
            pm.media_url AS primary_image
        FROM transactions t
        LEFT JOIN properties p ON p.property_id = t.property_id
        LEFT JOIN transaction_statuses ts ON ts.transaction_status_id = t.transaction_status_id
        LEFT JOIN transaction_types tt ON tt.transaction_type_id = t.transaction_type_id
        LEFT JOIN property_media pm
            ON pm.property_id = p.property_id
           AND pm.media_type_id = 1
           AND pm.media_status_id = 3
           AND pm.is_primary = TRUE
           AND pm.is_deleted = FALSE
        WHERE ${whereClause}
        ORDER BY ${orderBy}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    const mainResult = await pool.query(mainQuery, [...queryParams, limitNum, offset]);

    return {
        transactions: mainResult.rows,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            total_pages: Math.ceil(total / limitNum) || 1
        }
    };
};
/**
 * Fetch a single transaction by ID for a specific customer
 * @param {number|string} customerId
 * @param {number|string} transactionId
 */
const getTransactionById = async (customerId, transactionId) => {
    const query = `
        SELECT
            t.transaction_id,
            t.property_id,
            p.title AS property_title,
            p.address,
            p.city,
            p.sale_price,
            p.rent_price,
            p.bedrooms,
            p.bathrooms,
            p.area_value,
            pt.name AS property_type,
            tt.name AS transaction_type,
            ts.name AS transaction_status,
            t.agreed_amount,
            t.transaction_date,
            t.remarks,
            pm.media_url AS primary_image
        FROM transactions t
        LEFT JOIN properties p ON p.property_id = t.property_id
        LEFT JOIN property_types pt ON pt.property_type_id = p.property_type_id
        LEFT JOIN transaction_statuses ts ON ts.transaction_status_id = t.transaction_status_id
        LEFT JOIN transaction_types tt ON tt.transaction_type_id = t.transaction_type_id
        LEFT JOIN property_media pm
            ON pm.property_id = p.property_id
           AND pm.media_type_id = 1
           AND pm.media_status_id = 3
           AND pm.is_primary = TRUE
           AND pm.is_deleted = FALSE
        WHERE t.customer_id = $1 AND t.transaction_id = $2
    `;

    const result = await pool.query(query, [customerId, transactionId]);
    return result.rows[0] || null;
};
/**
 * Fetch customer's inspection reports summary
 * @param {number|string} customerId
 */
const getInspectionReportSummary = async (customerId) => {
    const query = `
        SELECT
            COUNT(DISTINCT ir.inspection_report_id) AS total_reports,

            COUNT(DISTINCT ir.inspection_report_id) FILTER (
                WHERE LOWER(ist.name) = 'completed'
            ) AS completed,

            COUNT(DISTINCT ir.inspection_report_id) FILTER (
                WHERE LOWER(ires.name) = 'passed'
            ) AS passed,

            COUNT(DISTINCT ir.inspection_report_id) FILTER (
                WHERE LOWER(ires.name) = 'requires attention'
            ) AS needs_attention

        FROM inspection_reports ir
        JOIN inspections i ON i.inspection_id = ir.inspection_id
        JOIN property_visits pv ON pv.property_id = i.property_id
        LEFT JOIN inspection_statuses ist ON ist.inspection_status_id = i.inspection_status_id
        LEFT JOIN inspection_results ires ON ires.inspection_result_id = ir.inspection_result_id
        WHERE pv.customer_id = $1;
    `;

    const result = await pool.query(query, [customerId]);
    return result.rows[0] || {
        total_reports: 0,
        completed: 0,
        passed: 0,
        needs_attention: 0
    };
};
/**
 * Fetch customer's inspection reports list with filters and pagination
 * @param {number|string} customerId
 * @param {Object} filters
 */
const getInspectionReportsList = async (customerId, filters = {}) => {
    const {
        search,
        status,
        result: inspectionResult,
        sort,
        page = 1,
        limit = 10
    } = filters;

    const whereConditions = [`pv.customer_id = $1`];
    const queryParams = [customerId];
    let paramIndex = 2;

    if (search && search.trim()) {
        whereConditions.push(`(p.title ILIKE $${paramIndex} OR p.address ILIKE $${paramIndex} OR p.city ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`);
        queryParams.push(`%${search.trim()}%`);
        paramIndex++;
    }

    if (status && status.trim()) {
        whereConditions.push(`LOWER(ist.name) = LOWER($${paramIndex})`);
        queryParams.push(status.trim());
        paramIndex++;
    }

    if (inspectionResult && inspectionResult.trim()) {
        whereConditions.push(`LOWER(ires.name) = LOWER($${paramIndex})`);
        queryParams.push(inspectionResult.trim());
        paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    let orderBy = 'ir.created_at DESC';
    if (sort) {
        if (sort === 'oldest') {
            orderBy = 'ir.created_at ASC';
        } else if (sort === 'date_desc') {
            orderBy = 'COALESCE(i.completed_at, i.scheduled_at) DESC NULLS LAST, ir.created_at DESC';
        } else if (sort === 'date_asc') {
            orderBy = 'COALESCE(i.completed_at, i.scheduled_at) ASC NULLS LAST, ir.created_at ASC';
        }
    }

    const countQuery = `
        SELECT COUNT(DISTINCT ir.inspection_report_id) AS total
        FROM inspection_reports ir
        JOIN inspections i ON i.inspection_id = ir.inspection_id
        JOIN property_visits pv ON pv.property_id = i.property_id
        JOIN properties p ON p.property_id = i.property_id
        LEFT JOIN inspection_statuses ist ON ist.inspection_status_id = i.inspection_status_id
        LEFT JOIN inspection_results ires ON ires.inspection_result_id = ir.inspection_result_id
        LEFT JOIN users u ON u.user_id = i.inspector_id
        WHERE ${whereClause};
    `;

    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total, 10) || 0;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const mainQuery = `
        SELECT
            ir.inspection_report_id,
            p.property_id,
            p.title AS property_title,
            p.address,
            p.city,
            u.name AS inspector_name,
            COALESCE(i.completed_at, i.scheduled_at) AS inspection_date,
            ist.name AS inspection_status,
            ires.name AS inspection_result,
            ir.overall_condition,
            ir.report_summary,
            pm.media_url AS primary_image
        FROM inspection_reports ir
        JOIN inspections i ON i.inspection_id = ir.inspection_id
        JOIN property_visits pv ON pv.property_id = i.property_id
        JOIN properties p ON p.property_id = i.property_id
        LEFT JOIN inspection_statuses ist ON ist.inspection_status_id = i.inspection_status_id
        LEFT JOIN inspection_results ires ON ires.inspection_result_id = ir.inspection_result_id
        LEFT JOIN users u ON u.user_id = i.inspector_id
        LEFT JOIN property_media pm
            ON pm.property_id = p.property_id
           AND pm.media_type_id = 1
           AND pm.media_status_id = 3
           AND pm.is_primary = TRUE
           AND pm.is_deleted = FALSE
        WHERE ${whereClause}
        GROUP BY 
            ir.inspection_report_id,
            p.property_id,
            p.title,
            p.address,
            p.city,
            u.name,
            i.completed_at,
            i.scheduled_at,
            ist.name,
            ires.name,
            ir.overall_condition,
            ir.report_summary,
            pm.media_url,
            ir.created_at
        ORDER BY ${orderBy}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    const mainResult = await pool.query(mainQuery, [...queryParams, limitNum, offset]);

    return {
        reports: mainResult.rows,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            total_pages: Math.ceil(total / limitNum) || 1
        }
    };
};
 
/**
 * Fetch a single inspection report by ID for a specific customer
 * @param {number|string} customerId
 * @param {number|string} reportId
 */
const getInspectionReportById = async (customerId, reportId) => {
    const query = `
        SELECT
            ir.inspection_report_id,
            ir.overall_condition,
            ir.report_summary,
            ir.findings,
            ir.recommendations,
            ir.reported_at,
            
            p.property_id,
            p.title AS property_title,
            p.address,
            p.city,
            
            i.inspection_id,
            COALESCE(i.completed_at, i.scheduled_at) AS inspection_date,
            i.notes AS inspection_notes,
            
            u.user_id AS inspector_id,
            u.name AS inspector_name,
            u.email AS inspector_email,
            u.mobile_no AS inspector_mobile,
            
            ist.name AS inspection_status,
            ires.name AS inspection_result,
            
            (
                SELECT COALESCE(json_agg(
                    json_build_object(
                        'inspection_media_id', im.inspection_media_id,
                        'file_name', im.file_name,
                        'file_url', im.file_url,
                        'caption', im.caption,
                        'media_type_id', im.media_type_id,
                        'created_at', im.created_at
                    )
                ), '[]'::json)
                FROM inspection_media im
                WHERE im.inspection_id = i.inspection_id
            ) AS media
        FROM inspection_reports ir
        JOIN inspections i ON i.inspection_id = ir.inspection_id
        JOIN properties p ON p.property_id = i.property_id
        LEFT JOIN inspection_statuses ist ON ist.inspection_status_id = i.inspection_status_id
        LEFT JOIN inspection_results ires ON ires.inspection_result_id = ir.inspection_result_id
        LEFT JOIN users u ON u.user_id = i.inspector_id
        WHERE ir.inspection_report_id = $2
          AND EXISTS (
              SELECT 1 FROM property_visits pv
              WHERE pv.property_id = i.property_id AND pv.customer_id = $1
          )
    `;

    const result = await pool.query(query, [customerId, reportId]);
    return result.rows[0] || null;
};

/**
 * Update customer profile details
 * @param {number|string} customerId
 * @param {Object} updateData
 */
const updateCustomerProfile = async (customerId, updateData) => {
    const { name, email, country, mobile_no } = updateData;

    // Check if email is already in use by another user
    if (email) {
        const emailCheckQuery = 'SELECT user_id FROM users WHERE email = $1 AND user_id != $2';
        const emailCheckResult = await pool.query(emailCheckQuery, [email, customerId]);
        if (emailCheckResult.rows.length > 0) {
            const error = new Error('Email is already in use');
            error.statusCode = 400;
            throw error;
        }
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(name);
    }
    if (email !== undefined) {
        updates.push(`email = $${paramIndex++}`);
        values.push(email);
    }
    if (country !== undefined) {
        updates.push(`country = $${paramIndex++}`);
        values.push(country);
    }
    if (mobile_no !== undefined) {
        updates.push(`mobile_no = $${paramIndex++}`);
        values.push(mobile_no);
    }

    if (updates.length === 0) {
        const error = new Error('No fields provided to update');
        error.statusCode = 400;
        throw error;
    }
    
    values.push(customerId);
    
    const query = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE user_id = $${paramIndex}
        RETURNING user_id, name, email, country, mobile_no, role_id
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    
    return result.rows[0];
};

/**
 * Get customer's current password by ID
 * @param {number|string} customerId
 */
const getCustomerPasswordById = async (customerId) => {
    const query = 'SELECT password FROM users WHERE user_id = $1';
    const result = await pool.query(query, [customerId]);
    return result.rows[0] ? result.rows[0].password : null;
};

/**
 * Update customer password
 * @param {number|string} customerId
 * @param {string} hashedPassword
 */
const updateCustomerPassword = async (customerId, hashedPassword) => {
    const query = 'UPDATE users SET password = $1 WHERE user_id = $2';
    await pool.query(query, [hashedPassword, customerId]);
    return true;
};

module.exports = {
    getUpcomingVisitByCustomerId,
    getRecentActivitiesByCustomerId,
    getCustomerVisits,
    getTransactionSummary,
    getCustomerTransactions,
    getTransactionById,
    getInspectionReportSummary,
    getInspectionReportsList,
    getInspectionReportById,
    updateCustomerProfile,
    getCustomerPasswordById,
    updateCustomerPassword
};
