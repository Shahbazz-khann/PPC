const { pool } = require('../../config/db');

/**
 * Fetch all active/available properties with primary image details (legacy)
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
        LEFT JOIN (
            SELECT DISTINCT ON (property_id) property_id, media_url
            FROM property_media
            WHERE media_type_id = 1
              AND media_status_id = 3
              AND is_primary = TRUE
              AND is_deleted = FALSE
            ORDER BY property_id, created_at ASC
        ) pm ON pm.property_id = p.property_id
        WHERE LOWER(ps.name) = 'active'
          AND p.is_deleted = FALSE
        ORDER BY p.created_at DESC;
    `;

    const result = await pool.query(query);
    return result.rows;
};

/**
 * Search & filter active properties for Customer browsing
 * @param {Object} filters
 */
const getAllProperties = async (filters = {}) => {
    const {
        search,
        purpose,
        property_type,
        city,
        min_price,
        max_price,
        bedrooms,
        bathrooms,
        area_unit,
        min_area,
        max_area,
        sort = 'newest',
        page = 1,
        limit = 10
    } = filters;

    const whereConditions = [
        `LOWER(ps.name) = 'active'`,
        `p.is_deleted = FALSE`
    ];
    const queryParams = [];
    let paramIndex = 1;

    // 1. Search (title, address, city)
    if (search && search.trim()) {
        whereConditions.push(`(
            p.title ILIKE $${paramIndex} OR 
            p.address ILIKE $${paramIndex} OR 
            p.city ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${search.trim()}%`);
        paramIndex++;
    }

    // 2. Purpose (sale / rent / all)
    if (purpose && purpose.toLowerCase() === 'sale') {
        whereConditions.push(`p.sale_price IS NOT NULL AND p.sale_price > 0`);
    } else if (purpose && purpose.toLowerCase() === 'rent') {
        whereConditions.push(`p.rent_price IS NOT NULL AND p.rent_price > 0`);
    }

    // 3. Property Type
    if (property_type) {
        if (!isNaN(property_type)) {
            whereConditions.push(`p.property_type_id = $${paramIndex}`);
            queryParams.push(parseInt(property_type, 10));
            paramIndex++;
        } else {
            whereConditions.push(`LOWER(pt.name) = LOWER($${paramIndex})`);
            queryParams.push(property_type.trim());
            paramIndex++;
        }
    }

    // 4. City
    if (city && city.trim()) {
        whereConditions.push(`LOWER(p.city) = LOWER($${paramIndex})`);
        queryParams.push(city.trim());
        paramIndex++;
    }

    // 5. Min Price
    if (min_price !== undefined && min_price !== null && min_price !== '' && !isNaN(min_price)) {
        const minVal = parseFloat(min_price);
        if (purpose && purpose.toLowerCase() === 'sale') {
            whereConditions.push(`p.sale_price >= $${paramIndex}`);
            queryParams.push(minVal);
            paramIndex++;
        } else if (purpose && purpose.toLowerCase() === 'rent') {
            whereConditions.push(`p.rent_price >= $${paramIndex}`);
            queryParams.push(minVal);
            paramIndex++;
        } else {
            whereConditions.push(`(
                (p.sale_price IS NOT NULL AND p.sale_price >= $${paramIndex}) OR
                (p.rent_price IS NOT NULL AND p.rent_price >= $${paramIndex})
            )`);
            queryParams.push(minVal);
            paramIndex++;
        }
    }

    // 6. Max Price
    if (max_price !== undefined && max_price !== null && max_price !== '' && !isNaN(max_price)) {
        const maxVal = parseFloat(max_price);
        if (purpose && purpose.toLowerCase() === 'sale') {
            whereConditions.push(`p.sale_price <= $${paramIndex}`);
            queryParams.push(maxVal);
            paramIndex++;
        } else if (purpose && purpose.toLowerCase() === 'rent') {
            whereConditions.push(`p.rent_price <= $${paramIndex}`);
            queryParams.push(maxVal);
            paramIndex++;
        } else {
            whereConditions.push(`(
                (p.sale_price IS NOT NULL AND p.sale_price <= $${paramIndex}) OR
                (p.rent_price IS NOT NULL AND p.rent_price <= $${paramIndex})
            )`);
            queryParams.push(maxVal);
            paramIndex++;
        }
    }

    // 7. Bedrooms
    if (bedrooms && !isNaN(bedrooms)) {
        whereConditions.push(`p.bedrooms >= $${paramIndex}`);
        queryParams.push(parseInt(bedrooms, 10));
        paramIndex++;
    }

    // 8. Bathrooms
    if (bathrooms && !isNaN(bathrooms)) {
        whereConditions.push(`p.bathrooms >= $${paramIndex}`);
        queryParams.push(parseInt(bathrooms, 10));
        paramIndex++;
    }

    // 9. Area Unit
    if (area_unit) {
        if (!isNaN(area_unit)) {
            whereConditions.push(`p.area_unit_id = $${paramIndex}`);
            queryParams.push(parseInt(area_unit, 10));
            paramIndex++;
        } else {
            whereConditions.push(`(LOWER(au.name) = LOWER($${paramIndex}) OR LOWER(au.symbol) = LOWER($${paramIndex}))`);
            queryParams.push(area_unit.trim());
            paramIndex++;
        }
    }

    // 10. Min Area / Max Area
    if (min_area && !isNaN(min_area)) {
        whereConditions.push(`p.area_value >= $${paramIndex}`);
        queryParams.push(parseFloat(min_area));
        paramIndex++;
    }
    if (max_area && !isNaN(max_area)) {
        whereConditions.push(`p.area_value <= $${paramIndex}`);
        queryParams.push(parseFloat(max_area));
        paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Sorting
    let orderByClause = 'ORDER BY p.created_at DESC';
    if (sort === 'price_asc') {
        orderByClause = 'ORDER BY LEAST(COALESCE(p.sale_price, 999999999999), COALESCE(p.rent_price, 999999999999)) ASC, p.created_at DESC';
    } else if (sort === 'price_desc') {
        orderByClause = 'ORDER BY GREATEST(COALESCE(p.sale_price, 0), COALESCE(p.rent_price, 0)) DESC, p.created_at DESC';
    } else if (sort === 'oldest') {
        orderByClause = 'ORDER BY p.created_at ASC';
    }

    // Count Query
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM properties p
        JOIN property_statuses ps ON ps.property_status_id = p.property_status_id
        JOIN property_types pt ON pt.property_type_id = p.property_type_id
        JOIN area_units au ON au.area_unit_id = p.area_unit_id
        WHERE ${whereClause};
    `;

    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total, 10) || 0;

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    // Main Query (using DISTINCT ON subquery for media to prevent duplicate property rows)
    const mainQuery = `
        SELECT
            p.property_id,
            p.title,
            p.description,
            p.address,
            p.city,
            p.property_type_id,
            pt.name AS property_type,
            p.property_status_id,
            ps.name AS property_status,
            p.sale_price,
            p.rent_price,
            CASE 
                WHEN p.sale_price IS NOT NULL AND p.rent_price IS NOT NULL THEN 'Sale / Rent'
                WHEN p.sale_price IS NOT NULL THEN 'For Sale'
                WHEN p.rent_price IS NOT NULL THEN 'For Rent'
                ELSE 'N/A'
            END AS purpose,
            p.bedrooms,
            p.bathrooms,
            p.area_value,
            p.area_unit_id,
            au.name AS area_unit,
            au.symbol AS area_symbol,
            pm.media_url AS primary_image,
            pm.media_url AS image,
            p.created_at,
            p.updated_at
        FROM properties p
        JOIN property_statuses ps ON ps.property_status_id = p.property_status_id
        JOIN property_types pt ON pt.property_type_id = p.property_type_id
        JOIN area_units au ON au.area_unit_id = p.area_unit_id
        LEFT JOIN (
            SELECT DISTINCT ON (property_id) property_id, media_url
            FROM property_media
            WHERE media_type_id = 1
              AND media_status_id = 3
              AND is_primary = TRUE
              AND is_deleted = FALSE
            ORDER BY property_id, created_at ASC
        ) pm ON pm.property_id = p.property_id
        WHERE ${whereClause}
        ${orderByClause}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    const mainResult = await pool.query(mainQuery, [...queryParams, limitNum, offset]);

    return {
        properties: mainResult.rows,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            total_pages: Math.ceil(total / limitNum) || 1
        }
    };
};

/**
 * Fetch complete details for a single active property
 * @param {number|string} propertyId
 */
const getPropertyById = async (propertyId) => {
    const query = `
        SELECT
            p.property_id,
            p.title,
            p.description,
            p.address,
            p.city,
            p.sale_price,
            p.rent_price,
            CASE 
                WHEN p.sale_price IS NOT NULL AND p.rent_price IS NOT NULL THEN 'Sale / Rent'
                WHEN p.sale_price IS NOT NULL THEN 'For Sale'
                WHEN p.rent_price IS NOT NULL THEN 'For Rent'
                ELSE 'N/A'
            END AS purpose,
            p.bedrooms,
            p.bathrooms,
            p.area_value,
            p.area_unit_id,
            au.name AS area_unit,
            au.symbol AS area_symbol,
            p.property_type_id,
            pt.name AS property_type,
            p.property_status_id,
            ps.name AS property_status,
            p.owner_id,
            u.name AS owner_name,
            u.email AS owner_email,
            u.mobile_no AS owner_mobile,
            p.created_at,
            p.updated_at
        FROM properties p
        JOIN property_statuses ps ON ps.property_status_id = p.property_status_id
        JOIN property_types pt ON pt.property_type_id = p.property_type_id
        JOIN area_units au ON au.area_unit_id = p.area_unit_id
        LEFT JOIN users u ON u.user_id = p.owner_id
        WHERE p.property_id = $1
          AND LOWER(ps.name) = 'active'
          AND p.is_deleted = FALSE;
    `;

    const result = await pool.query(query, [propertyId]);
    const property = result.rows[0];

    if (!property) {
        return null;
    }

    // Fetch approved media (both images media_type_id = 1 and videos media_type_id = 2)
    const mediaQuery = `
        SELECT 
            media_id,
            media_type_id,
            media_url,
            is_primary,
            created_at
        FROM property_media
        WHERE property_id = $1
          AND media_status_id = 3
          AND is_deleted = FALSE
        ORDER BY is_primary DESC, created_at ASC;
    `;

    const mediaResult = await pool.query(mediaQuery, [propertyId]);
    const mediaList = mediaResult.rows;

    // Filter strictly for image (media_type_id = 1) for primary_image
    const primaryImageObj = mediaList.find(m => m.is_primary && Number(m.media_type_id) === 1)
        || mediaList.find(m => Number(m.media_type_id) === 1)
        || null;

    return {
        ...property,
        primary_image: primaryImageObj ? primaryImageObj.media_url : null,
        image: primaryImageObj ? primaryImageObj.media_url : null,
        media: mediaList
    };
};

module.exports = {
    getAvailableProperties,
    getAllProperties,
    getPropertyById,
};
