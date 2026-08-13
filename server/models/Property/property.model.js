const { pool } = require('../../config/db');

/**
 * Fetch all active/available properties with primary image details
 */
const getAvailableProperties = async () => {
    const query = `
        SELECT
            p.property_id,
            p.title,
            p.address,
            p.city,
            pt.name AS property_type,
            ps.name AS property_status,
            p.sale_price,
            p.rent_price,
            p.bedrooms,
            p.bathrooms,
            p.area_value,
            au.name AS area_unit,
            pm.media_url AS primary_image
        FROM properties p
        JOIN property_statuses ps ON ps.property_status_id = p.property_status_id
        JOIN property_types pt ON pt.property_type_id = p.property_type_id
        JOIN area_units au ON au.area_unit_id = p.area_unit_id
        LEFT JOIN property_media pm
            ON pm.property_id = p.property_id
           AND pm.media_type_id = 1
           AND pm.media_status_id = 3
           AND pm.is_primary = TRUE
           AND pm.is_deleted = FALSE
        WHERE LOWER(ps.name) = 'active'
        ORDER BY p.created_at DESC;
    `;

    const result = await pool.query(query);
    return result.rows;
};

module.exports = {
    getAvailableProperties,
};
