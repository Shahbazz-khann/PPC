const pool = require('../../config/db').pool;

const PUBLIC_ELIGIBILITY_JOINS = `
    JOIN property_approvals pa ON p.property_id = pa.property_id AND pa.is_active = true
    JOIN approval_stages ast ON pa.approval_stage_id = ast.approval_stage_id AND ast.approval_stage_english = 'Approved'
    JOIN property_status ps ON p.property_id = ps.property_id AND ps.is_active = true
    JOIN property_status_types pst ON ps.status_id = pst.status_id AND pst.status_english = 'Active'
    JOIN property_demand pd ON p.property_id = pd.property_id AND pd.is_active = true
    JOIN property_demand_types pdt ON pd.demand_type_id = pdt.demand_type_id AND pdt.demand_type_english IN ('Sale', 'Rent')
`;

const PUBLIC_ELIGIBILITY_WHERE = `
    COALESCE(pd.final_amount, pd.demand_amount) IS NOT NULL
`;

/**
 * Get Public Properties based on strict eligibility and optional filters
 * @param {Object} filters - filters
 * @param {number} limit - maximum number of records to return
 */
const getPublicProperties = async (filters = {}, limit = 50) => {
    let query = `
        SELECT 
            p.property_id,
            'PRP-' || LPAD(p.property_id::text, 3, '0') AS formatted_id,
            pdt.demand_type_english AS demand_type,
            pt.property_type_description AS property_type,
            pu.property_use_description AS property_use,
            s.society_english AS society,
            c.city_english AS city,
            p.property_size,
            u.uom_english AS size_uom,
            p.property_rooms AS rooms,
            p.property_bath_rooms AS bathrooms,
            p.property_description,
            COALESCE(pd.final_amount, pd.demand_amount) AS current_price,
            cur.currency_code,
            pp.picture_url AS image_url,
            (
                SELECT COALESCE(array_agg(pp2.picture_url ORDER BY pp2.display_order ASC), ARRAY[]::text[])
                FROM property_pictures pp2
                WHERE pp2.property_id = p.property_id AND pp2.is_active = true
            ) AS images,
            (
                SELECT pv.video_url
                FROM property_videos pv
                WHERE pv.property_id = p.property_id AND pv.is_active = true
                ORDER BY pv.display_order ASC
                LIMIT 1
            ) AS video_url,
            p.creation_date_time,
            COALESCE(cu.mobile, '+92 333 5373095') AS contact_phone
        FROM properties p
        ${PUBLIC_ELIGIBILITY_JOINS}
        LEFT JOIN currencies cur ON pd.demand_currency_id = cur.currency_id
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN property_use pu ON p.property_use_id = pu.property_use_id
        LEFT JOIN uom u ON p.property_size_uom = u.uom_id
        LEFT JOIN areas a ON p.area_id = a.area_id
        LEFT JOIN societies s ON a.society_id = s.society_id
        LEFT JOIN cities c ON s.city_id = c.city_id
        LEFT JOIN customers cu ON p.customer_id = cu.customer_id
        LEFT JOIN property_pictures pp ON p.property_id = pp.property_id AND pp.is_active = true AND pp.display_order = 1
        WHERE ${PUBLIC_ELIGIBILITY_WHERE}
    `;

    const params = [];
    let paramIndex = 1;

    // Direct Property ID Filter
    if (filters.propertyId) {
        query += ` AND p.property_id = $${paramIndex++}`;
        params.push(filters.propertyId);
    }

    // Basic Filters
    if (filters.intent) {
        query += ` AND pdt.demand_type_english = $${paramIndex++}`;
        params.push(filters.intent);
    }
    
    if (filters.city) {
        query += ` AND c.city_english = $${paramIndex++}`;
        params.push(filters.city);
    }

    if (filters.propertyType && filters.propertyType !== 'All Types') {
        query += ` AND pt.property_type_description = $${paramIndex++}`;
        params.push(filters.propertyType);
    }

    if (filters.minPrice !== undefined && filters.minPrice !== null) {
        query += ` AND COALESCE(pd.final_amount, pd.demand_amount) >= $${paramIndex++}`;
        params.push(filters.minPrice);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
        query += ` AND COALESCE(pd.final_amount, pd.demand_amount) <= $${paramIndex++}`;
        params.push(filters.maxPrice);
    }

    // Advanced V1 Filters
    if (filters.society) {
        query += ` AND s.society_english = $${paramIndex++}`;
        params.push(filters.society);
    }

    if (filters.area) {
        query += ` AND a.area_english = $${paramIndex++}`;
        params.push(filters.area);
    }

    if (filters.propertyUse) {
        query += ` AND pu.property_use_description = $${paramIndex++}`;
        params.push(filters.propertyUse);
    }

    if (filters.sizeUom) {
        query += ` AND u.uom_english = $${paramIndex++}`;
        params.push(filters.sizeUom);
    }

    if (filters.minSize !== undefined && filters.minSize !== null) {
        query += ` AND p.property_size >= $${paramIndex++}`;
        params.push(filters.minSize);
    }

    if (filters.maxSize !== undefined && filters.maxSize !== null) {
        query += ` AND p.property_size <= $${paramIndex++}`;
        params.push(filters.maxSize);
    }

    if (filters.rooms !== undefined && filters.rooms !== null) {
        query += ` AND p.property_rooms >= $${paramIndex++}`;
        params.push(filters.rooms);
    }

    if (filters.bathrooms !== undefined && filters.bathrooms !== null) {
        query += ` AND p.property_bath_rooms >= $${paramIndex++}`;
        params.push(filters.bathrooms);
    }

    query += ` ORDER BY p.creation_date_time DESC LIMIT $${paramIndex++}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
};

/**
 * Get dynamic filter options from active reference tables.
 * Contextual filtering allows narrowing down societies/areas based on parent selection.
 * @param {string} city - optional city filter
 * @param {string} society - optional society filter
 */
const getPublicPropertyFilters = async (city = null, society = null) => {
    // 1. Fetch all active cities (Global)
    const citiesQuery = `
        SELECT DISTINCT c.city_english
        FROM cities c
        WHERE c.is_active = true AND c.city_english IS NOT NULL
        ORDER BY c.city_english ASC
    `;

    // 2. Fetch all active property types (Global)
    const typesQuery = `
        SELECT property_type_description
        FROM property_types
        WHERE is_active = true
        ORDER BY property_type_id ASC
    `;

    // 3. Fetch all active property uses (Global)
    const usesQuery = `
        SELECT property_use_description
        FROM property_use
        WHERE is_active = true
        ORDER BY property_use_id ASC
    `;

    // 4. Fetch all active size UOMs (Global)
    const uomsQuery = `
        SELECT uom_english
        FROM uom
        WHERE is_active = true
        ORDER BY uom_id ASC
    `;

    // 5. Fetch active societies from reference table (Contextual based on City)
    let societiesWhere = `s.is_active = true AND c.is_active = true AND s.society_english IS NOT NULL`;
    const societiesParams = [];
    if (city) {
        societiesWhere += ` AND c.city_english = $1`;
        societiesParams.push(city);
    }
    const societiesQuery = `
        SELECT DISTINCT s.society_english
        FROM societies s
        JOIN cities c ON s.city_id = c.city_id
        WHERE ${societiesWhere}
        ORDER BY s.society_english ASC
    `;

    // 6. Fetch active areas from reference table (Contextual based on City AND Society)
    let areasWhere = `a.is_active = true AND s.is_active = true AND c.is_active = true AND a.area_english IS NOT NULL`;
    const areasParams = [];
    let areaParamIdx = 1;
    if (city) {
        areasWhere += ` AND c.city_english = $${areaParamIdx++}`;
        areasParams.push(city);
    }
    if (society) {
        areasWhere += ` AND s.society_english = $${areaParamIdx++}`;
        areasParams.push(society);
    }
    const areasQuery = `
        SELECT DISTINCT a.area_english
        FROM areas a
        JOIN societies s ON a.society_id = s.society_id
        JOIN cities c ON s.city_id = c.city_id
        WHERE ${areasWhere}
        ORDER BY a.area_english ASC
    `;

    const [citiesResult, typesResult, usesResult, uomsResult, societiesResult, areasResult] = await Promise.all([
        pool.query(citiesQuery),
        pool.query(typesQuery),
        pool.query(usesQuery),
        pool.query(uomsQuery),
        pool.query(societiesQuery, societiesParams),
        pool.query(areasQuery, areasParams)
    ]);

    return {
        cities: citiesResult.rows.map(row => row.city_english),
        propertyTypes: typesResult.rows.map(row => row.property_type_description),
        propertyUses: usesResult.rows.map(row => row.property_use_description),
        sizeUoms: uomsResult.rows.map(row => row.uom_english),
        societies: societiesResult.rows.map(row => row.society_english),
        areas: areasResult.rows.map(row => row.area_english)
    };
};

module.exports = {
    getPublicProperties,
    getPublicPropertyFilters
};
