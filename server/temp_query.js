require('dotenv').config();
const { pool } = require('./config/db');

const query = `
SELECT 
    p.property_id,
    'PRP-' || LPAD(p.property_id::text, 3, '0') AS formatted_id,
    pt.property_type_description AS property_type,
    s.society_english AS society,
    c.city_english AS city,
    p.property_size,
    u.uom_english AS size_uom,
    pst.status_english AS current_status,
    pdt.demand_type_english AS current_demand_type,
    pp.picture_url AS image_url
FROM customers cu
JOIN properties p ON p.customer_id = cu.customer_id
LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
LEFT JOIN areas a ON p.area_id = a.area_id
LEFT JOIN societies s ON a.society_id = s.society_id
LEFT JOIN cities c ON s.city_id = c.city_id
LEFT JOIN tehsils t ON c.tehsil_id = t.tehsil_id
LEFT JOIN districts d ON t.district_id = d.district_id
LEFT JOIN divisions dv ON d.division_id = dv.division_id
LEFT JOIN provinces pr ON dv.province_id = pr.province_id
LEFT JOIN countries co ON pr.country_id = co.country_id
LEFT JOIN uom u ON p.property_size_uom = u.uom_id
LEFT JOIN property_status ps ON ps.property_id = p.property_id AND ps.is_active = true
LEFT JOIN property_status_types pst ON pst.status_id = ps.status_id
LEFT JOIN property_demand pd ON pd.property_id = p.property_id AND pd.is_active = true
LEFT JOIN property_demand_types pdt ON pdt.demand_type_id = pd.demand_type_id
LEFT JOIN property_pictures pp ON pp.property_id = p.property_id AND pp.is_active = true AND pp.display_order = 1
WHERE cu.user_id = 1
ORDER BY p.creation_date_time DESC
LIMIT 3;
`;

pool.query(query).then(res => {
    console.log(res.rows);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
