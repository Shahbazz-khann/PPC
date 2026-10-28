const { pool } = require('../../config/db');

/**
 * Retrieves a paginated list of properties for Admin Operations.
 *
 * @param {Object} [options={}]
 * @param {string} [options.search] - Free-text search on PRP formatted ID, customer name, mobile, society, city, property type.
 * @param {string} [options.approval_stage] - Filter by approval stage ('Pending', 'Under Review', 'Approved', 'Rejected', or 'all').
 * @param {string} [options.status] - Filter by status ('Active', 'Inactive', 'Suspended', 'Withdrawn', or 'all').
 * @param {string} [options.demand_type] - Filter by demand type ('Sale', 'Rent', or 'all').
 * @param {string} [options.property_type] - Filter by property type description or ID.
 * @param {number} [options.page=1] - 1-based page number.
 * @param {number} [options.limit=10] - Number of records per page.
 * @returns {Promise<{ rows: Array<Object>, pagination: { total: number, page: number, limit: number, totalPages: number } }>}
 */
const getAdminProperties = async (options = {}) => {
  const {
    search,
    approval_stage,
    status,
    demand_type,
    property_type,
    page = 1,
    limit = 10,
  } = options;

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const offset = (parsedPage - 1) * parsedLimit;

  const whereConditions = [];
  const params = [];

  // 1. Search filter
  if (search && typeof search === 'string' && search.trim() !== '') {
    const trimmed = search.trim();
    const searchPattern = `%${trimmed}%`;
    const searchIdx = params.length + 1;
    params.push(searchPattern);

    // Check if searching for exact numeric ID or PRP-XXX
    const prpMatch = trimmed.match(/^PRP-(\d+)$/i);
    const numericId = prpMatch ? prpMatch[1] : (/^\d+$/.test(trimmed) ? trimmed : null);

    if (numericId) {
      const idIdx = params.length + 1;
      params.push(numericId);
      whereConditions.push(`(
        p.property_id = $${idIdx}
        OR cu.customer_first_name ILIKE $${searchIdx}
        OR cu.customer_last_name ILIKE $${searchIdx}
        OR cu.mobile ILIKE $${searchIdx}
        OR s.society_english ILIKE $${searchIdx}
        OR ci.city_english ILIKE $${searchIdx}
        OR pt.property_type_description ILIKE $${searchIdx}
      )`);
    } else {
      whereConditions.push(`(
        cu.customer_first_name ILIKE $${searchIdx}
        OR cu.customer_last_name ILIKE $${searchIdx}
        OR cu.mobile ILIKE $${searchIdx}
        OR s.society_english ILIKE $${searchIdx}
        OR ci.city_english ILIKE $${searchIdx}
        OR pt.property_type_description ILIKE $${searchIdx}
      )`);
    }
  }

  // 2. Approval Stage filter
  if (approval_stage && typeof approval_stage === 'string' && approval_stage.toLowerCase() !== 'all') {
    const stageIdx = params.length + 1;
    params.push(approval_stage.trim().toLowerCase());
    whereConditions.push(`LOWER(COALESCE(aps.approval_stage_english, 'pending')) = $${stageIdx}`);
  }

  // 3. Status filter
  if (status && typeof status === 'string' && status.toLowerCase() !== 'all') {
    const statusIdx = params.length + 1;
    params.push(status.trim().toLowerCase());
    whereConditions.push(`LOWER(COALESCE(pst.status_english, CASE WHEN p.is_active = true THEN 'active' ELSE 'inactive' END)) = $${statusIdx}`);
  }

  // 4. Demand Type filter (Sale / Rent)
  if (demand_type && typeof demand_type === 'string' && demand_type.toLowerCase() !== 'all') {
    const demandIdx = params.length + 1;
    params.push(demand_type.trim().toLowerCase());
    whereConditions.push(`LOWER(COALESCE(pdt.demand_type_english, '')) = $${demandIdx}`);
  }

  // 5. Property Type filter
  if (property_type && typeof property_type === 'string' && property_type.toLowerCase() !== 'all') {
    const typeIdx = params.length + 1;
    params.push(property_type.trim().toLowerCase());
    whereConditions.push(`LOWER(COALESCE(pt.property_type_description, '')) = $${typeIdx}`);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Count Query
  const countQuery = `
    SELECT COUNT(DISTINCT p.property_id)::text AS total
    FROM properties p
    JOIN customers cu ON p.customer_id = cu.customer_id
    LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
    LEFT JOIN areas a ON p.area_id = a.area_id
    LEFT JOIN societies s ON a.society_id = s.society_id
    LEFT JOIN cities ci ON s.city_id = ci.city_id
    LEFT JOIN property_demand pd ON pd.property_id = p.property_id AND pd.is_active = true
    LEFT JOIN property_demand_types pdt ON pd.demand_type_id = pdt.demand_type_id
    LEFT JOIN property_status ps ON ps.property_id = p.property_id AND ps.is_active = true
    LEFT JOIN property_status_types pst ON ps.status_id = pst.status_id
    LEFT JOIN property_approvals pa ON pa.property_id = p.property_id AND pa.is_active = true
    LEFT JOIN approval_stages aps ON pa.approval_stage_id = aps.approval_stage_id
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0]?.total || '0', 10);

  // Data Query
  const dataParams = [...params];
  const limitIdx = dataParams.length + 1;
  dataParams.push(parsedLimit);
  const offsetIdx = dataParams.length + 1;
  dataParams.push(offset);

  const dataQuery = `
    SELECT
      p.property_id::text AS property_id,
      'PRP-' || LPAD(p.property_id::text, 3, '0') AS formatted_id,
      cu.customer_id::text AS customer_id,
      TRIM(CONCAT_WS(' ', ct.title_abb, cu.customer_first_name, cu.customer_middle_name, cu.customer_last_name)) AS customer_name,
      cu.mobile AS customer_mobile,
      cu.email AS customer_email,
      pt.property_type_id::text AS property_type_id,
      pt.property_type_description AS property_type,
      pu.property_use_id::text AS property_use_id,
      pu.property_use_description AS property_use,
      pl.property_location_id::text AS property_location_id,
      pl.property_location_description AS property_location,
      a.area_id::text AS area_id,
      a.area_english AS area,
      s.society_id::text AS society_id,
      s.society_english AS society,
      ci.city_id::text AS city_id,
      ci.city_english AS city,
      p.property_size,
      u.uom_english AS size_uom,
      CASE WHEN ms.marla_size_sqft IS NOT NULL THEN ms.marla_size_sqft::text || ' Sq Ft' ELSE NULL END AS marla_size,
      p.property_covered_area_sqft AS covered_area_sqft,
      p.property_open_area_sqft AS open_area_sqft,
      p.property_rooms AS rooms,
      p.property_bath_rooms AS bathrooms,
      p.property_floors AS floors,
      p.property_lounges AS lounges,
      p.property_kitchens AS kitchens,
      p.property_drawing_rooms AS drawing_rooms,
      p.property_swimming_pool AS swimming_pool,
      p.property_media_room AS media_room,
      p.property_solar_is_installed AS solar_installed,
      p.property_solar_capacity AS solar_capacity,
      p.property_electric_meters AS electric_meters,
      p.property_gas_meters AS gas_meters,
      p.property_road_size_front_ft AS road_front_ft,
      p.property_road_size_back_ft AS road_back_ft,
      p.property_road_size_left_ft AS road_left_ft,
      p.property_road_size_right_ft AS road_right_ft,
      p.property_size_front,
      p.property_size_back,
      p.property_size_left,
      p.property_size_right,
      p.property_description,
      pd.demand_amount,
      pd.discount_amount,
      pd.final_amount,
      pdt.demand_type_english AS demand_type,
      COALESCE(pst.status_english, CASE WHEN p.is_active = true THEN 'Active' ELSE 'Inactive' END) AS status,
      COALESCE(aps.approval_stage_english, 'Pending') AS approval_stage,
      pa.approval_remarks,
      (SELECT COUNT(*)::int FROM property_pictures pp WHERE pp.property_id = p.property_id AND pp.is_active = true) AS total_photos,
      pp_first.picture_url AS cover_image,
      p.creation_date_time,
      p.update_date_time
    FROM properties p
    JOIN customers cu ON p.customer_id = cu.customer_id
    LEFT JOIN customer_titles ct ON cu.customer_title_id = ct.customer_title_id
    LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
    LEFT JOIN property_use pu ON p.property_use_id = pu.property_use_id
    LEFT JOIN property_locations pl ON p.property_location_id = pl.property_location_id
    LEFT JOIN areas a ON p.area_id = a.area_id
    LEFT JOIN societies s ON a.society_id = s.society_id
    LEFT JOIN cities ci ON s.city_id = ci.city_id
    LEFT JOIN uom u ON p.property_size_uom = u.uom_id
    LEFT JOIN marla_sizes ms ON p.property_marla_size_id = ms.marla_id
    LEFT JOIN property_demand pd ON pd.property_id = p.property_id AND pd.is_active = true
    LEFT JOIN property_demand_types pdt ON pd.demand_type_id = pdt.demand_type_id
    LEFT JOIN property_status ps ON ps.property_id = p.property_id AND ps.is_active = true
    LEFT JOIN property_status_types pst ON ps.status_id = pst.status_id
    LEFT JOIN property_approvals pa ON pa.property_id = p.property_id AND pa.is_active = true
    LEFT JOIN approval_stages aps ON pa.approval_stage_id = aps.approval_stage_id
    LEFT JOIN LATERAL (
      SELECT picture_url
      FROM property_pictures
      WHERE property_id = p.property_id AND is_active = true
      ORDER BY display_order ASC, property_picture_id ASC
      LIMIT 1
    ) pp_first ON true
    ${whereClause}
    ORDER BY p.creation_date_time DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;

  const dataResult = await pool.query(dataQuery, dataParams);

  return {
    rows: dataResult.rows,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: total === 0 ? 0 : Math.ceil(total / parsedLimit),
    },
  };
};

/**
 * Retrieves global property summary metrics for Admin Operations.
 * Completely independent of any table filters.
 *
 * @returns {Promise<Object>}
 */
const getAdminPropertyStats = async () => {
  const query = `
    SELECT
      COUNT(DISTINCT p.property_id)::text AS total_properties,
      COUNT(DISTINCT p.property_id) FILTER (
        WHERE LOWER(COALESCE(aps.approval_stage_english, '')) = 'pending'
      )::text AS pending_approval,
      COUNT(DISTINCT p.property_id) FILTER (
        WHERE LOWER(COALESCE(aps.approval_stage_english, '')) = 'under review'
      )::text AS under_review,
      COUNT(DISTINCT p.property_id) FILTER (
        WHERE LOWER(COALESCE(aps.approval_stage_english, '')) = 'approved'
      )::text AS approved,
      COUNT(DISTINCT p.property_id) FILTER (
        WHERE LOWER(COALESCE(aps.approval_stage_english, '')) = 'rejected'
      )::text AS rejected,
      COUNT(DISTINCT p.property_id) FILTER (
        WHERE LOWER(COALESCE(pst.status_english, '')) = 'active'
      )::text AS active_properties,
      COUNT(DISTINCT p.property_id) FILTER (
        WHERE LOWER(COALESCE(pst.status_english, '')) = 'inactive'
      )::text AS inactive_properties,
      COUNT(DISTINCT p.property_id) FILTER (
        WHERE LOWER(COALESCE(pdt.demand_type_english, '')) = 'sale'
      )::text AS for_sale,
      COUNT(DISTINCT p.property_id) FILTER (
        WHERE LOWER(COALESCE(pdt.demand_type_english, '')) = 'rent'
      )::text AS for_rent
    FROM properties p
    LEFT JOIN property_approvals pa ON pa.property_id = p.property_id AND pa.is_active = true
    LEFT JOIN approval_stages aps ON pa.approval_stage_id = aps.approval_stage_id
    LEFT JOIN property_status ps ON ps.property_id = p.property_id AND ps.is_active = true
    LEFT JOIN property_status_types pst ON ps.status_id = pst.status_id
    LEFT JOIN property_demand pd ON pd.property_id = p.property_id AND pd.is_active = true
    LEFT JOIN property_demand_types pdt ON pd.demand_type_id = pdt.demand_type_id;
  `;

  const result = await pool.query(query);
  const row = result.rows[0] || {};

  return {
    total: parseInt(row.total_properties || '0', 10),
    pending: parseInt(row.pending_approval || '0', 10),
    underReview: parseInt(row.under_review || '0', 10),
    approved: parseInt(row.approved || '0', 10),
    rejected: parseInt(row.rejected || '0', 10),
    active: parseInt(row.active_properties || '0', 10),
    inactive: parseInt(row.inactive_properties || '0', 10),
    forSale: parseInt(row.for_sale || '0', 10),
    forRent: parseInt(row.for_rent || '0', 10),
  };
};

/**
 * Retrieves full 360-degree inspection detail for a single property by ID.
 *
 * @param {string} propertyId - Positive integer string.
 * @returns {Promise<Object|null>}
 */
const getAdminPropertyById = async (propertyId) => {
  const query = `
    SELECT
      p.property_id::text AS property_id,
      'PRP-' || LPAD(p.property_id::text, 3, '0') AS formatted_id,
      cu.customer_id::text AS customer_id,
      TRIM(CONCAT_WS(' ', ct.title_abb, cu.customer_first_name, cu.customer_middle_name, cu.customer_last_name)) AS customer_name,
      cu.mobile AS customer_mobile,
      cu.email AS customer_email,
      pt.property_type_id::text AS property_type_id,
      pt.property_type_description AS property_type,
      pu.property_use_id::text AS property_use_id,
      pu.property_use_description AS property_use,
      pl.property_location_id::text AS property_location_id,
      pl.property_location_description AS property_location,
      co.country_id::text AS country_id,
      co.country_english AS country,
      pr.province_id::text AS province_id,
      pr.province_english AS province,
      dv.division_id::text AS division_id,
      dv.division_english AS division,
      d.district_id::text AS district_id,
      d.district_english AS district,
      t.tehsil_id::text AS tehsil_id,
      t.tehsil_english AS tehsil,
      ci.city_id::text AS city_id,
      ci.city_english AS city,
      s.society_id::text AS society_id,
      s.society_english AS society,
      a.area_id::text AS area_id,
      a.area_english AS area,
      p.property_size,
      u.uom_english AS size_uom,
      CASE WHEN ms.marla_size_sqft IS NOT NULL THEN ms.marla_size_sqft::text || ' Sq Ft' ELSE NULL END AS marla_size,
      p.property_covered_area_sqft AS covered_area_sqft,
      p.property_open_area_sqft AS open_area_sqft,
      p.property_rooms AS rooms,
      p.property_bath_rooms AS bathrooms,
      p.property_floors AS floors,
      p.property_lounges AS lounges,
      p.property_kitchens AS kitchens,
      p.property_drawing_rooms AS drawing_rooms,
      p.property_swimming_pool AS swimming_pool,
      p.property_media_room AS media_room,
      p.property_solar_is_installed AS solar_installed,
      p.property_solar_capacity AS solar_capacity,
      p.property_electric_meters AS electric_meters,
      p.property_gas_meters AS gas_meters,
      p.property_road_size_front_ft AS road_front_ft,
      p.property_road_size_back_ft AS road_back_ft,
      p.property_road_size_left_ft AS road_left_ft,
      p.property_road_size_right_ft AS road_right_ft,
      p.property_size_front,
      p.property_size_back,
      p.property_size_left,
      p.property_size_right,
      p.property_description,
      pd.demand_amount,
      pd.discount_amount,
      pd.final_amount,
      pdt.demand_type_english AS demand_type,
      COALESCE(pst.status_english, CASE WHEN p.is_active = true THEN 'Active' ELSE 'Inactive' END) AS status,
      COALESCE(aps.approval_stage_english, 'Pending') AS approval_stage,
      pa.approval_remarks,
      p.is_active,
      p.creation_date_time,
      p.update_date_time
    FROM properties p
    JOIN customers cu ON p.customer_id = cu.customer_id
    LEFT JOIN customer_titles ct ON cu.customer_title_id = ct.customer_title_id
    LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
    LEFT JOIN property_use pu ON p.property_use_id = pu.property_use_id
    LEFT JOIN property_locations pl ON p.property_location_id = pl.property_location_id
    LEFT JOIN areas a ON p.area_id = a.area_id
    LEFT JOIN societies s ON a.society_id = s.society_id
    LEFT JOIN cities ci ON s.city_id = ci.city_id
    LEFT JOIN tehsils t ON ci.tehsil_id = t.tehsil_id
    LEFT JOIN districts d ON t.district_id = d.district_id
    LEFT JOIN divisions dv ON d.division_id = dv.division_id
    LEFT JOIN provinces pr ON dv.province_id = pr.province_id
    LEFT JOIN countries co ON pr.country_id = co.country_id
    LEFT JOIN uom u ON p.property_size_uom = u.uom_id
    LEFT JOIN marla_sizes ms ON p.property_marla_size_id = ms.marla_id
    LEFT JOIN property_demand pd ON pd.property_id = p.property_id AND pd.is_active = true
    LEFT JOIN property_demand_types pdt ON pd.demand_type_id = pdt.demand_type_id
    LEFT JOIN property_status ps ON ps.property_id = p.property_id AND ps.is_active = true
    LEFT JOIN property_status_types pst ON ps.status_id = pst.status_id
    LEFT JOIN property_approvals pa ON pa.property_id = p.property_id AND pa.is_active = true
    LEFT JOIN approval_stages aps ON pa.approval_stage_id = aps.approval_stage_id
    WHERE p.property_id = $1;
  `;

  const result = await pool.query(query, [propertyId]);
  if (result.rowCount === 0) return null;

  const property = result.rows[0];

  // Fetch pictures
  const picRes = await pool.query(
    `SELECT property_picture_id::text AS id, picture_url AS url, picture_description AS title, display_order
     FROM property_pictures
     WHERE property_id = $1 AND is_active = true
     ORDER BY display_order ASC, property_picture_id ASC`,
    [propertyId]
  );
  property.pictures = picRes.rows;

  // Fetch amenities
  const amRes = await pool.query(
    `SELECT a.amenity_id::text AS amenity_id, a.amenity_description AS name
     FROM property_amenities pa
     JOIN amenities a ON pa.amenity_id = a.amenity_id
     WHERE pa.property_id = $1 AND pa.is_active = true AND a.is_active = true`,
    [propertyId]
  );
  property.amenities = amRes.rows.map((r) => r.name);

  return property;
};

/**
 * Updates a property's approval stage and maintains an audit trail.
 * If stage is 'Approved', automatically activates the property status.
 * If stage is 'Rejected', automatically deactivates the property status.
 *
 * @param {string|number} propertyId
 * @param {string} stageName - 'Pending' | 'Under Review' | 'Approved' | 'Rejected'
 * @param {string} [remarks] - Inspection/approval audit notes
 * @param {string|number} [userId] - Administrator performing the action
 * @returns {Promise<Object>}
 */
const updateAdminPropertyApproval = async (propertyId, stageName, remarks, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify property exists and fetch owner user_id
    const propRes = await client.query(
      `SELECT p.property_id, c.user_id 
       FROM properties p 
       LEFT JOIN customers c ON p.customer_id = c.customer_id 
       WHERE p.property_id = $1 FOR UPDATE`,
      [propertyId]
    );
    if (propRes.rowCount === 0) {
      throw new Error('Property not found');
    }
    const ownerUserId = propRes.rows[0]?.user_id || null;

    // 2. Resolve approval_stage_id
    const stageRes = await client.query(
      'SELECT approval_stage_id, approval_stage_english FROM approval_stages WHERE LOWER(approval_stage_english) = LOWER($1) AND is_active = true',
      [stageName.trim()]
    );
    if (stageRes.rowCount === 0) {
      throw new Error(`Invalid approval stage: ${stageName}`);
    }
    const { approval_stage_id, approval_stage_english } = stageRes.rows[0];

    // 3. Deactivate previous active approval records
    await client.query(
      'UPDATE property_approvals SET is_active = false, update_date_time = NOW() WHERE property_id = $1 AND is_active = true',
      [propertyId]
    );

    // 4. Insert new active approval record
    await client.query(
      `INSERT INTO property_approvals (
        property_id, approval_stage_id, effective_date, approval_remarks,
        created_by_user, creation_date_time, update_date_time, is_active
      ) VALUES ($1, $2, CURRENT_DATE, $3, $4, NOW(), NOW(), true)`,
      [propertyId, approval_stage_id, remarks || null, userId || null]
    );

    // 5. Automatic status synchronization
    let newStatus = null;
    if (approval_stage_english === 'Approved') {
      newStatus = 'Active';
      await client.query(
        'UPDATE property_status SET is_active = false, update_date_time = NOW() WHERE property_id = $1 AND is_active = true',
        [propertyId]
      );
      await client.query(
        `INSERT INTO property_status (
          property_id, status_id, effective_date, status_remarks,
          created_by_user, creation_date_time, update_date_time, is_active
        ) VALUES ($1, 1, CURRENT_DATE, 'Auto-activated upon Admin Approval', $2, NOW(), NOW(), true)`,
        [propertyId, userId || null]
      );
      await client.query('UPDATE properties SET is_active = true, update_date_time = NOW() WHERE property_id = $1', [propertyId]);
    } else {
      newStatus = 'Inactive';
      await client.query(
        'UPDATE property_status SET is_active = false, update_date_time = NOW() WHERE property_id = $1 AND is_active = true',
        [propertyId]
      );
      await client.query(
        `INSERT INTO property_status (
          property_id, status_id, effective_date, status_remarks,
          created_by_user, creation_date_time, update_date_time, is_active
        ) VALUES ($1, 2, CURRENT_DATE, $2, $3, NOW(), NOW(), true)`,
        [propertyId, `Deactivated upon stage change to ${approval_stage_english}`, userId || null]
      );
    }

    await client.query('COMMIT');

    return {
      property_id: String(propertyId),
      approval_stage: approval_stage_english,
      approval_remarks: remarks || null,
      status: newStatus,
      user_id: ownerUserId,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Updates a property's listing status and maintains an audit trail.
 *
 * @param {string|number} propertyId
 * @param {string} statusName - 'Active' | 'Inactive' | 'Suspended' | 'Withdrawn'
 * @param {string} [remarks] - Reason for status modification
 * @param {string|number} [userId] - Administrator performing the action
 * @returns {Promise<Object>}
 */
const updateAdminPropertyStatus = async (propertyId, statusName, remarks, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify property exists
    const propRes = await client.query('SELECT property_id FROM properties WHERE property_id = $1 FOR UPDATE', [propertyId]);
    if (propRes.rowCount === 0) {
      throw new Error('Property not found');
    }

    // 2. Resolve status_id
    const statusRes = await client.query(
      'SELECT status_id, status_english FROM property_status_types WHERE LOWER(status_english) = LOWER($1) AND is_active = true',
      [statusName.trim()]
    );
    if (statusRes.rowCount === 0) {
      throw new Error(`Invalid status type: ${statusName}`);
    }
    const { status_id, status_english } = statusRes.rows[0];

    // 3. Deactivate previous active status record
    await client.query(
      'UPDATE property_status SET is_active = false, update_date_time = NOW() WHERE property_id = $1 AND is_active = true',
      [propertyId]
    );

    // 4. Insert new active status record
    await client.query(
      `INSERT INTO property_status (
        property_id, status_id, effective_date, status_remarks,
        created_by_user, creation_date_time, update_date_time, is_active
      ) VALUES ($1, $2, CURRENT_DATE, $3, $4, NOW(), NOW(), true)`,
      [propertyId, status_id, remarks || null, userId || null]
    );

    // 5. Update properties.is_active flag
    const isPropertyActive = status_english === 'Active';
    await client.query('UPDATE properties SET is_active = $1, update_date_time = NOW() WHERE property_id = $2', [isPropertyActive, propertyId]);

    await client.query('COMMIT');

    return {
      property_id: String(propertyId),
      status: status_english,
      status_remarks: remarks || null,
      is_active: isPropertyActive,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Creates a new property on behalf of a customer (Admin operations).
 *
 * @param {Object} data - Property registration fields
 * @param {string|number} data.customerId - The customer owning this property
 * @param {string|number} userId - Admin user ID performing the creation
 * @returns {Promise<Object>}
 */
const createAdminProperty = async (data, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify customer exists
    const custRes = await client.query(
      'SELECT customer_id FROM customers WHERE customer_id = $1 AND is_active = true',
      [data.customerId]
    );
    if (custRes.rowCount === 0) {
      throw new Error('Customer not found or inactive');
    }
    const customerId = custRes.rows[0].customer_id;

    // 2. Validate Area
    const areaCheck = await client.query('SELECT area_id FROM areas WHERE area_id = $1 AND is_active = true', [data.area_id]);
    if (areaCheck.rowCount === 0) {
      throw new Error('Selected area not found or inactive');
    }

    // 3. Insert Property
    const propertyInsertQuery = `
      INSERT INTO properties (
        customer_id, area_id, property_type_id, property_use_id, property_location_id,
        property_size, property_size_uom, property_marla_size_id,
        property_area_marla, property_area_kanal, property_area_acre, property_area_sqft, property_area_sqyard,
        property_size_front, property_size_back, property_size_left, property_size_right,
        property_covered_area_sqft, property_open_area_sqft,
        property_rooms, property_bath_rooms, property_floors, property_lounges, property_kitchens, property_drawing_rooms,
        property_road_size_front_ft, property_road_size_back_ft, property_road_size_left_ft, property_road_size_right_ft,
        property_swimming_pool, property_media_room, property_solar_is_installed, property_solar_capacity,
        property_electric_meters, property_gas_meters, property_description,
        creation_date_time, update_date_time, created_by_user, is_active
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11, $12, $13,
        $14, $15, $16, $17,
        $18, $19,
        $20, $21, $22, $23, $24, $25,
        $26, $27, $28, $29,
        $30, $31, $32, $33,
        $34, $35, $36,
        NOW(), NOW(), $37, true
      ) RETURNING property_id
    `;

    const propertyParams = [
      customerId,
      data.area_id,
      data.propertyType || null,
      data.propertyUse || null,
      data.propertyLocation || null,
      data.propertySize || null,
      data.sizeUom || null,
      data.marlaSize || null,
      data.areaMarla || null,
      data.areaKanal || null,
      data.areaAcre || null,
      data.areaSqFt || null,
      data.areaSqYard || null,
      data.propertySizeFront || null,
      data.propertySizeBack || null,
      data.propertySizeLeft || null,
      data.propertySizeRight || null,
      data.coveredAreaSqFt || null,
      data.openAreaSqFt || null,
      data.rooms || 0,
      data.bathrooms || 0,
      data.floors || 0,
      data.lounges || 0,
      data.kitchens || 0,
      data.drawingRooms || 0,
      data.roadFrontFt || null,
      data.roadBackFt || null,
      data.roadLeftFt || null,
      data.roadRightFt || null,
      data.swimmingPool || false,
      data.mediaRoom || false,
      data.solarInstalled || false,
      data.solarCapacity || null,
      data.electricMeters || 0,
      data.gasMeters || 0,
      data.propertyDescription || null,
      userId || null,
    ];

    const propRes = await client.query(propertyInsertQuery, propertyParams);
    const propertyId = propRes.rows[0].property_id;

    // 4. Handle Amenities
    if (data.amenities && Array.isArray(data.amenities)) {
      for (const amenityText of data.amenities) {
        if (!amenityText) continue;
        const cleanText = String(amenityText).trim();
        if (cleanText === '') continue;

        const amCheck = await client.query('SELECT amenity_id FROM amenities WHERE LOWER(amenity_description) = LOWER($1)', [cleanText]);
        let amenityId;
        if (amCheck.rowCount > 0) {
          amenityId = amCheck.rows[0].amenity_id;
        } else {
          const amInsert = await client.query('INSERT INTO amenities (amenity_description, is_active) VALUES ($1, true) RETURNING amenity_id', [cleanText]);
          amenityId = amInsert.rows[0].amenity_id;
        }

        await client.query(
          `INSERT INTO property_amenities (property_id, amenity_id, is_active)
           VALUES ($1, $2, true)
           ON CONFLICT ON CONSTRAINT uq_property_amenity DO NOTHING`,
          [propertyId, amenityId]
        );
      }
    }

    // 5. Initial Approval Stage ('Pending' or requested stage)
    const initialStage = data.approval_stage || 'Pending';
    const stageRes = await client.query(
      'SELECT approval_stage_id, approval_stage_english FROM approval_stages WHERE LOWER(approval_stage_english) = LOWER($1) AND is_active = true',
      [initialStage.trim()]
    );
    const approvalStageId = stageRes.rowCount > 0 ? stageRes.rows[0].approval_stage_id : 1;
    const approvalStageName = stageRes.rowCount > 0 ? stageRes.rows[0].approval_stage_english : 'Pending';

    await client.query(
      `INSERT INTO property_approvals (
        property_id, approval_stage_id, effective_date, approval_remarks,
        created_by_user, creation_date_time, update_date_time, is_active
      ) VALUES ($1, $2, CURRENT_DATE, $3, $4, NOW(), NOW(), true)`,
      [propertyId, approvalStageId, data.approval_remarks || 'Registered by Administrator', userId || null]
    );

    // 6. Initial Status: Active if Approved, otherwise Inactive
    const isApproved = approvalStageName === 'Approved';
    const statusId = isApproved ? 1 : 2;
    const statusName = isApproved ? 'Active' : 'Inactive';

    await client.query(
      `INSERT INTO property_status (
        property_id, status_id, effective_date, status_remarks,
        created_by_user, creation_date_time, update_date_time, is_active
      ) VALUES ($1, $2, CURRENT_DATE, $3, $4, NOW(), NOW(), true)`,
      [propertyId, statusId, isApproved ? 'Auto-activated on Admin Approval' : 'Initial Inactive state awaiting review', userId || null]
    );

    // 7. Optional Demand / Financials
    if (data.demand_type_id && data.demand_amount) {
      await client.query(
        `INSERT INTO property_demand (
          property_id, demand_type_id, effective_date, demand_amount,
          margin_amount, created_by_user, creation_date_time, update_date_time, is_active
        ) VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, NOW(), NOW(), true)`,
        [propertyId, data.demand_type_id, data.demand_amount, data.margin_amount || null, userId || null]
      );
    }

    await client.query('COMMIT');

    const formattedId = `PRP-${String(propertyId).padStart(3, '0')}`;
    return {
      property_id: String(propertyId),
      formatted_id: formattedId,
      customer_id: String(customerId),
      approval_stage: approvalStageName,
      status: statusName,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const uploadAdminPropertyPictures = async (propertyId, userId, pictureUrls) => {
  const customerModel = require('../Customer/customer.model');
  return await customerModel.uploadPropertyPictures(propertyId, userId, pictureUrls);
};

const uploadAdminPropertyVideo = async (propertyId, userId, videoUrl) => {
  const customerModel = require('../Customer/customer.model');
  return await customerModel.uploadPropertyVideo(propertyId, userId, videoUrl);
};

module.exports = {
  getAdminProperties,
  getAdminPropertyStats,
  getAdminPropertyById,
  updateAdminPropertyApproval,
  updateAdminPropertyStatus,
  createAdminProperty,
  uploadAdminPropertyPictures,
  uploadAdminPropertyVideo,
};


