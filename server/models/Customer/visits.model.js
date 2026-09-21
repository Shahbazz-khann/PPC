const { pool } = require('../../config/db');

/**
 * Get all property visits linked to the customer's requests
 * @param {number} userId 
 */
const getCustomerPropertyVisits = async (userId) => {
    const query = `
        SELECT 
            pv.visit_id AS "visitId",
            pv.request_id AS "requestId",
            pv.property_id AS "propertyId",
            
            TO_CHAR(pv.visit_scheduled_date, 'YYYY-MM-DD') AS "scheduledDate",
            TO_CHAR(pv.visit_scheduled_time, 'HH12:MI AM') AS "scheduledTime",
            
            TO_CHAR(pv.visit_actual_date, 'YYYY-MM-DD') AS "actualDate",
            TO_CHAR(pv.visit_actual_time, 'HH12:MI AM') AS "actualTime",
            
            pt.property_type_description AS "propertyType",
            soc.society_english AS "societyName",
            cit.city_english AS "cityName",
            p.property_size AS "propertySize",
            u.uom_english AS "propertySizeUom",
            pic.picture_url AS "imageUrl",
            
            CASE
                WHEN pv.visit_conducted_employee_id IS NOT NULL THEN
                    json_build_object(
                        'employeeId', emp.employee_id,
                        'name', TRIM(CONCAT_WS(' ', emp.first_name, emp.middle_name, emp.last_name)),
                        'designation', d.designation_english
                    )
                ELSE null
            END AS "conductedBy",
            
            pv.visitor_remarks AS "visitorRemarks"
            
        FROM property_visits pv
        INNER JOIN customer_requests cr ON pv.request_id = cr.request_id
        INNER JOIN customers cust ON cr.customer_id = cust.customer_id
        INNER JOIN properties p ON pv.property_id = p.property_id
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN areas a ON p.area_id = a.area_id
        LEFT JOIN societies soc ON a.society_id = soc.society_id
        LEFT JOIN cities cit ON soc.city_id = cit.city_id
        LEFT JOIN uom u ON p.property_size_uom = u.uom_id
        LEFT JOIN employees emp ON pv.visit_conducted_employee_id = emp.employee_id
        LEFT JOIN designations d ON emp.designation_id = d.designation_id
        LEFT JOIN LATERAL (
            SELECT picture_url 
            FROM property_pictures 
            WHERE property_id = p.property_id AND is_active = true 
            ORDER BY display_order ASC 
            LIMIT 1
        ) pic ON true
        WHERE cust.user_id = $1
          AND pv.visitor_customer_id = cr.customer_id
          AND pv.is_active = true
        ORDER BY 
            COALESCE(pv.visit_actual_date, pv.visit_scheduled_date) DESC,
            COALESCE(pv.visit_actual_time, pv.visit_scheduled_time) DESC,
            pv.visit_id DESC
    `;

    const { rows } = await pool.query(query, [userId]);
    
    // Process stringified numerics if needed, but standard practice in PPC is keeping it simple.
    // The instructions say "Use raw PostgreSQL bigint identity" for IDs and keep response shape.
    return rows.map(row => ({
        ...row,
        propertySize: row.propertySize ? parseFloat(row.propertySize) : null
    }));
};

/**
 * Get details of a single property visit for the authenticated customer
 * @param {number} userId 
 * @param {number|string} visitId 
 */
const getCustomerPropertyVisitById = async (userId, visitId) => {
    const query = `
        SELECT 
            pv.visit_id AS "visitId",
            pv.request_id AS "requestId",
            pv.property_id AS "propertyId",
            
            TO_CHAR(pv.visit_scheduled_date, 'YYYY-MM-DD') AS "scheduledDate",
            TO_CHAR(pv.visit_scheduled_time, 'HH12:MI AM') AS "scheduledTime",
            
            TO_CHAR(pv.visit_actual_date, 'YYYY-MM-DD') AS "actualDate",
            TO_CHAR(pv.visit_actual_time, 'HH12:MI AM') AS "actualTime",
            
            CASE
                WHEN pv.visit_conducted_employee_id IS NOT NULL THEN
                    json_build_object(
                        'employeeId', emp.employee_id,
                        'name', TRIM(CONCAT_WS(' ', emp.first_name, emp.middle_name, emp.last_name)),
                        'designation', d.designation_english
                    )
                ELSE null
            END AS "conductedBy",
            
            pv.visitor_remarks AS "visitorRemarks",
            pv.visit_conducted_employee_remarks AS "employeeRemarks",
            
            json_build_object(
                'propertyType', pt.property_type_description,
                'societyName', soc.society_english,
                'cityName', cit.city_english,
                'propertySize', p.property_size,
                'propertySizeUom', u.uom_english,
                'imageUrl', pic.picture_url
            ) AS "property"
            
        FROM property_visits pv
        INNER JOIN customer_requests cr ON pv.request_id = cr.request_id
        INNER JOIN customers cust ON cr.customer_id = cust.customer_id
        INNER JOIN properties p ON pv.property_id = p.property_id
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN areas a ON p.area_id = a.area_id
        LEFT JOIN societies soc ON a.society_id = soc.society_id
        LEFT JOIN cities cit ON soc.city_id = cit.city_id
        LEFT JOIN uom u ON p.property_size_uom = u.uom_id
        LEFT JOIN employees emp ON pv.visit_conducted_employee_id = emp.employee_id
        LEFT JOIN designations d ON emp.designation_id = d.designation_id
        LEFT JOIN LATERAL (
            SELECT picture_url 
            FROM property_pictures 
            WHERE property_id = p.property_id AND is_active = true 
            ORDER BY display_order ASC 
            LIMIT 1
        ) pic ON true
        WHERE cust.user_id = $1
          AND pv.visit_id = $2
          AND pv.visitor_customer_id = cr.customer_id
          AND pv.is_active = true
    `;

    const { rows } = await pool.query(query, [userId, visitId]);
    if (!rows.length) return null;

    const row = rows[0];
    
    // Parse numeric if necessary within property
    if (row.property && row.property.propertySize) {
        row.property.propertySize = parseFloat(row.property.propertySize);
    }

    return row;
};

/**
 * Safely submit one-time customer remarks for a completed property visit.
 * Evaluates business rules securely.
 * @param {number} userId
 * @param {number|string} visitId
 * @param {string} remarks
 * @returns {Object} result - contains { status, message, data }
 */
const submitCustomerVisitRemarks = async (userId, visitId, remarks) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Step 1: Securely fetch and lock the visit for this specific customer
        const checkQuery = `
            SELECT 
                pv.visit_id, 
                pv.visit_actual_date, 
                pv.visitor_remarks
            FROM property_visits pv
            INNER JOIN customer_requests cr ON pv.request_id = cr.request_id
            INNER JOIN customers cust ON cr.customer_id = cust.customer_id
            WHERE cust.user_id = $1
              AND pv.visit_id = $2
              AND pv.visitor_customer_id = cr.customer_id
              AND pv.is_active = true
            FOR UPDATE
        `;
        
        const { rows } = await client.query(checkQuery, [userId, visitId]);
        
        // If no rows, the visit doesn't exist, is inactive, or belongs to another customer
        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return { status: 404, message: 'Property visit not found', data: null };
        }
        
        const visit = rows[0];
        
        // Step 2: Enforce "Completed visit only" rule
        if (visit.visit_actual_date === null) {
            await client.query('ROLLBACK');
            return { status: 400, message: 'Remarks can only be submitted after the property visit is completed.', data: null };
        }
        
        // Step 3: Enforce "One-time only" rule
        if (visit.visitor_remarks !== null) {
            await client.query('ROLLBACK');
            return { status: 400, message: 'Remarks have already been submitted for this property visit.', data: null };
        }
        
        // Step 4: Perform atomic update
        const updateQuery = `
            UPDATE property_visits
            SET visitor_remarks = $1,
                update_date_time = CURRENT_TIMESTAMP
            WHERE visit_id = $2
            RETURNING visit_id AS "visitId", visitor_remarks AS "visitorRemarks"
        `;
        
        const updateResult = await client.query(updateQuery, [remarks, visitId]);
        
        await client.query('COMMIT');
        
        return { status: 200, message: 'Visit remarks submitted successfully', data: updateResult.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    getCustomerPropertyVisits,
    getCustomerPropertyVisitById,
    submitCustomerVisitRemarks
};
