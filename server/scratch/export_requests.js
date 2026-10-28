require('dotenv').config({ path: './.env' });
const { pool } = require('../config/db');
const fs = require('fs');

async function run() {
  const query = `
    SELECT 
      cr.request_id::text AS id,
      'REQ-' || LPAD(cr.request_id::text, 3, '0') AS formatted_id,
      cr.customer_id::text AS customer_id,
      TRIM(CONCAT_WS(' ', c.customer_first_name, c.customer_last_name)) AS customer_name,
      c.mobile AS customer_mobile,
      c.email AS customer_email,
      CASE WHEN cr.request_purpose_id IS NOT NULL THEN 'PROPERTY' ELSE 'SERVICE' END AS category,
      pp.purpose_description AS purpose,
      ps.service_english AS service,
      cr.property_id::text AS property_id,
      CASE WHEN cr.property_id IS NOT NULL THEN 'PRP-' || LPAD(cr.property_id::text, 3, '0') ELSE NULL END AS formatted_property_id,
      pt_linked.property_type_description AS linked_property_type,
      soc_linked.society_english AS linked_society,
      cit_linked.city_english AS linked_city,
      cr.request_description AS description,
      cr.request_audio_url AS audio_url,
      cr.creation_date_time AS created_at,
      COALESCE(st.request_status_english, 'Pending') AS status,
      st.request_status_abb AS status_abb,
      pr.minimum_budget,
      pr.maximum_budget,
      pt_req.property_type_description AS req_property_type,
      soc_req.society_english AS req_society,
      cit_req.city_english AS req_city
    FROM customer_requests cr
    JOIN customers c ON cr.customer_id = c.customer_id
    LEFT JOIN property_purposes pp ON cr.request_purpose_id = pp.purpose_id
    LEFT JOIN ppc_services ps ON cr.service_id = ps.service_id
    LEFT JOIN properties prop_linked ON cr.property_id = prop_linked.property_id
    LEFT JOIN property_types pt_linked ON prop_linked.property_type_id = pt_linked.property_type_id
    LEFT JOIN areas a_linked ON prop_linked.area_id = a_linked.area_id
    LEFT JOIN societies soc_linked ON a_linked.society_id = soc_linked.society_id
    LEFT JOIN cities cit_linked ON soc_linked.city_id = cit_linked.city_id
    LEFT JOIN customer_request_status_history sh ON cr.request_id = sh.request_id AND sh.is_active = true
    LEFT JOIN customer_request_status_types st ON sh.request_status_type_id = st.request_status_type_id
    LEFT JOIN customer_request_property_requirements pr ON cr.request_id = pr.request_id AND pr.is_active = true
    LEFT JOIN property_types pt_req ON pr.property_type_id = pt_req.property_type_id
    LEFT JOIN societies soc_req ON pr.society_id = soc_req.society_id
    LEFT JOIN cities cit_req ON pr.city_id = cit_req.city_id
    ORDER BY cr.creation_date_time DESC, cr.request_id DESC;
  `;
  const result = await pool.query(query);
  fs.writeFileSync('./admin_requests_initial.json', JSON.stringify(result.rows, null, 2));
  console.log('Successfully saved', result.rows.length, 'records to admin_requests_initial.json');
  await pool.end();
}

run().catch(err => {
  console.error('Error exporting requests:', err);
  process.exit(1);
});
