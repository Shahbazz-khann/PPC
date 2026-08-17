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

module.exports = {
    getUpcomingVisitByCustomerId,
    getRecentActivitiesByCustomerId,
    getCustomerVisits,
};
