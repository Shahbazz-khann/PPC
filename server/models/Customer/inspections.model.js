const { pool } = require('../../config/db');

/**
 * Get all completed inspection reports for properties owned by the customer
 * @param {number} userId 
 */
const getCustomerInspectionReports = async (userId) => {
    const query = `
        SELECT 
            pis.inspection_schedule_id AS "inspectionId",
            pis.property_id AS "propertyId",
            pis.inspection_actual_date AS "inspectionDate",
            pis.inspection_actual_time AS "inspectionTime",
            pt.property_type_description AS "propertyType",
            soc.society_english AS "societyName",
            cit.city_english AS "cityName",
            p.property_size AS "propertySize",
            u.uom_english AS "propertySizeUom",
            pic.picture_url AS "imageUrl",
            CASE
                WHEN pis.inspection_employee_id IS NOT NULL THEN
                    json_build_object(
                        'employeeId', emp.employee_id,
                        'name', TRIM(CONCAT_WS(' ', emp.first_name, emp.middle_name, emp.last_name)),
                        'designation', d.designation_english
                    )
                ELSE null
            END AS "inspectedBy"
        FROM property_inspection_schedule pis
        INNER JOIN properties p ON pis.property_id = p.property_id
        INNER JOIN customers cust ON p.customer_id = cust.customer_id
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN areas a ON p.area_id = a.area_id
        LEFT JOIN societies soc ON a.society_id = soc.society_id
        LEFT JOIN cities cit ON soc.city_id = cit.city_id
        LEFT JOIN uom u ON p.property_size_uom = u.uom_id
        LEFT JOIN employees emp ON pis.inspection_employee_id = emp.employee_id
        LEFT JOIN designations d ON emp.designation_id = d.designation_id
        LEFT JOIN LATERAL (
            SELECT picture_url 
            FROM property_pictures 
            WHERE property_id = p.property_id AND is_active = true 
            ORDER BY display_order ASC 
            LIMIT 1
        ) pic ON true
        WHERE cust.user_id = $1
          AND pis.inspection_actual_date IS NOT NULL
          AND pis.is_active = true
        ORDER BY pis.inspection_actual_date DESC, pis.inspection_actual_time DESC, pis.inspection_schedule_id DESC
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows;
};

/**
 * Get details of a single completed inspection report
 * @param {number} userId 
 * @param {number|string} inspectionId 
 */
const getCustomerInspectionReportById = async (userId, inspectionId) => {
    const query = `
        SELECT 
            pis.inspection_schedule_id AS "inspectionId",
            pis.property_id AS "propertyId",
            pis.inspection_actual_date AS "inspectionDate",
            pis.inspection_actual_time AS "inspectionTime",
            pis.inspection_findings AS "findings",
            pis.inspection_remarks AS "remarks",
            CASE
                WHEN pis.inspection_employee_id IS NOT NULL THEN
                    json_build_object(
                        'employeeId', emp.employee_id,
                        'name', TRIM(CONCAT_WS(' ', emp.first_name, emp.middle_name, emp.last_name)),
                        'designation', d.designation_english
                    )
                ELSE null
            END AS "inspectedBy",
            json_build_object(
                'propertyType', pt.property_type_description,
                'societyName', soc.society_english,
                'cityName', cit.city_english,
                'propertySize', p.property_size,
                'propertySizeUom', u.uom_english,
                'imageUrl', pic.picture_url
            ) AS "property"
        FROM property_inspection_schedule pis
        INNER JOIN properties p ON pis.property_id = p.property_id
        INNER JOIN customers cust ON p.customer_id = cust.customer_id
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN areas a ON p.area_id = a.area_id
        LEFT JOIN societies soc ON a.society_id = soc.society_id
        LEFT JOIN cities cit ON soc.city_id = cit.city_id
        LEFT JOIN uom u ON p.property_size_uom = u.uom_id
        LEFT JOIN employees emp ON pis.inspection_employee_id = emp.employee_id
        LEFT JOIN designations d ON emp.designation_id = d.designation_id
        LEFT JOIN LATERAL (
            SELECT picture_url 
            FROM property_pictures 
            WHERE property_id = p.property_id AND is_active = true 
            ORDER BY display_order ASC 
            LIMIT 1
        ) pic ON true
        WHERE cust.user_id = $1
          AND pis.inspection_schedule_id = $2
          AND pis.inspection_actual_date IS NOT NULL
          AND pis.is_active = true
    `;

    const { rows } = await pool.query(query, [userId, inspectionId]);
    if (!rows.length) return null;
    
    // Explicitly add checklist: [] for V1
    const report = rows[0];
    report.checklist = [];
    return report;
};

module.exports = {
    getCustomerInspectionReports,
    getCustomerInspectionReportById
};
