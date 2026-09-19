const { pool } = require('../../config/db');

/**
 * Get all properties for a customer with their current verification status
 * This implements the Property-Centric Dashboard model (Model B)
 * @param {number} userId 
 */
const getCustomerVerificationReports = async (userId) => {
    const query = `
        SELECT 
            p.property_id AS "propertyId",
            pv.verification_id AS "verificationId",
            ast.approval_stage_english AS "approvalStage",
            ast.approval_stage_abb AS "approvalStageAbb",
            pt.property_type_description AS "propertyType",
            soc.society_english AS "societyName",
            cit.city_english AS "cityName",
            p.property_size AS "propertySize",
            u.uom_english AS "propertySizeUom",
            pic.picture_url AS "imageUrl",
            pv.verification_date AS "verificationDate",
            pv.verification_time AS "verificationTime",
            CASE
                WHEN pv.verification_id IS NOT NULL THEN
                    json_build_object(
                        'employeeId', pv.employee_id,
                        'name', TRIM(CONCAT_WS(' ', pv.first_name, pv.middle_name, pv.last_name)),
                        'designation', pv.designation_english
                    )
                ELSE null
            END AS "verifiedBy"
        FROM properties p
        INNER JOIN customers c ON p.customer_id = c.customer_id
        INNER JOIN property_approvals pa ON pa.property_id = p.property_id AND pa.is_active = true
        INNER JOIN approval_stages ast ON ast.approval_stage_id = pa.approval_stage_id
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN areas a ON p.area_id = a.area_id
        LEFT JOIN societies soc ON a.society_id = soc.society_id
        LEFT JOIN cities cit ON soc.city_id = cit.city_id
        LEFT JOIN uom u ON p.property_size_uom = u.uom_id
        LEFT JOIN LATERAL (
            SELECT picture_url 
            FROM property_pictures 
            WHERE property_id = p.property_id AND is_active = true 
            ORDER BY display_order ASC 
            LIMIT 1
        ) pic ON true
        LEFT JOIN LATERAL (
            SELECT 
                v.verification_id, 
                v.verification_date, 
                v.verification_time, 
                e.employee_id, 
                e.first_name, 
                e.middle_name, 
                e.last_name, 
                d.designation_english
            FROM property_verifications v
            LEFT JOIN employees e ON v.verification_employee_id = e.employee_id
            LEFT JOIN designations d ON e.designation_id = d.designation_id
            WHERE v.property_id = p.property_id AND v.is_active = true
            ORDER BY v.creation_date_time DESC, v.verification_id DESC
            LIMIT 1
        ) pv ON true
        WHERE c.user_id = $1
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows;
};

/**
 * Get details for a specific property's verification status
 * @param {number} userId 
 * @param {number} propertyId 
 */
const getCustomerVerificationReportByPropertyId = async (userId, propertyId) => {
    const query = `
        SELECT 
            p.property_id AS "propertyId",
            pv.verification_id AS "verificationId",
            ast.approval_stage_english AS "approvalStage",
            ast.approval_stage_abb AS "approvalStageAbb",
            json_build_object(
                'propertyType', pt.property_type_description,
                'societyName', soc.society_english,
                'cityName', cit.city_english,
                'propertySize', p.property_size,
                'propertySizeUom', u.uom_english,
                'imageUrl', pic.picture_url
            ) AS "property",
            CASE
                WHEN pv.verification_id IS NOT NULL THEN
                    json_build_object(
                        'verificationDate', pv.verification_date,
                        'verificationTime', pv.verification_time,
                        'findings', pv.verification_findings,
                        'remarks', pv.verification_remarks,
                        'verifiedBy', CASE 
                            WHEN pv.employee_id IS NOT NULL THEN
                                json_build_object(
                                    'employeeId', pv.employee_id,
                                    'name', TRIM(CONCAT_WS(' ', pv.first_name, pv.middle_name, pv.last_name)),
                                    'designation', pv.designation_english
                                )
                            ELSE null
                        END
                    )
                ELSE null
            END AS "verification"
        FROM properties p
        INNER JOIN customers c ON p.customer_id = c.customer_id
        INNER JOIN property_approvals pa ON pa.property_id = p.property_id AND pa.is_active = true
        INNER JOIN approval_stages ast ON ast.approval_stage_id = pa.approval_stage_id
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN areas a ON p.area_id = a.area_id
        LEFT JOIN societies soc ON a.society_id = soc.society_id
        LEFT JOIN cities cit ON soc.city_id = cit.city_id
        LEFT JOIN uom u ON p.property_size_uom = u.uom_id
        LEFT JOIN LATERAL (
            SELECT picture_url 
            FROM property_pictures 
            WHERE property_id = p.property_id AND is_active = true 
            ORDER BY display_order ASC 
            LIMIT 1
        ) pic ON true
        LEFT JOIN LATERAL (
            SELECT 
                v.verification_id, 
                v.verification_date, 
                v.verification_time, 
                v.verification_findings,
                v.verification_remarks,
                e.employee_id, 
                e.first_name, 
                e.middle_name, 
                e.last_name, 
                d.designation_english
            FROM property_verifications v
            LEFT JOIN employees e ON v.verification_employee_id = e.employee_id
            LEFT JOIN designations d ON e.designation_id = d.designation_id
            WHERE v.property_id = p.property_id AND v.is_active = true
            ORDER BY v.creation_date_time DESC, v.verification_id DESC
            LIMIT 1
        ) pv ON true
        WHERE c.user_id = $1 AND p.property_id = $2
    `;

    const { rows } = await pool.query(query, [userId, propertyId]);
    return rows.length ? rows[0] : null;
};

module.exports = {
    getCustomerVerificationReports,
    getCustomerVerificationReportByPropertyId
};
