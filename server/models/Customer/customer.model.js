const { pool } = require('../../config/db');

/**
 * Get Customer Profile by User ID
 * @param {number} userId 
 */
const getCustomerProfileByUserId = async (userId) => {
    const query = `
        SELECT
            u.user_id,
            u.profile_image_url,
            u.email,
            
            c.customer_id,
            c.customer_title_id,
            ct.title_description,
            ct.title_abb,
            
            c.customer_first_name AS first_name,
            c.customer_middle_name AS middle_name,
            c.customer_last_name AS last_name,
            
            c.gender_id,
            g.gender_english,
            
            c.identity_type_id,
            it.identity_description AS identity_type_description,
            c.customer_id_number AS identity_number,
            
            c.country_id,
            co.country_english,
            
            c.mobile,
            c.date_of_registration,
            c.mobile_allowed,
            c.web_allowed,
            c.is_active
            
        FROM customers c
        JOIN users u ON c.user_id = u.user_id
        LEFT JOIN customer_titles ct ON c.customer_title_id = ct.customer_title_id
        LEFT JOIN identity_types it ON c.identity_type_id = it.identity_type_id
        LEFT JOIN genders g ON c.gender_id = g.gender_id
        LEFT JOIN countries co ON c.country_id = co.country_id
        WHERE c.user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
};

/**
 * Update Customer Profile by User ID (Transactional)
 */
const updateCustomerProfileByUserId = async (userId, profileData) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Verify customer exists
        const checkCustomer = await client.query('SELECT customer_id FROM customers WHERE user_id = $1 FOR UPDATE', [userId]);
        if (checkCustomer.rows.length === 0) {
            throw new Error('Customer profile not found');
        }

        // 2. Validate References
        const titleRes = await client.query('SELECT 1 FROM customer_titles WHERE customer_title_id = $1 AND is_active = true', [profileData.customer_title_id]);
        if (titleRes.rows.length === 0) throw new Error('Invalid or inactive Customer Title');

        if (profileData.gender_id) {
            const genderRes = await client.query('SELECT 1 FROM genders WHERE gender_id = $1 AND is_active = true', [profileData.gender_id]);
            if (genderRes.rows.length === 0) throw new Error('Invalid or inactive Gender');
        }

        const idRes = await client.query('SELECT 1 FROM identity_types WHERE identity_type_id = $1 AND is_active = true', [profileData.identity_type_id]);
        if (idRes.rows.length === 0) throw new Error('Invalid or inactive Identity Type');

        const countryRes = await client.query('SELECT country_english FROM countries WHERE country_id = $1 AND is_active = true', [profileData.country_id]);
        if (countryRes.rows.length === 0) throw new Error('Invalid or inactive Country');
        const countryEnglish = countryRes.rows[0].country_english;

        // 3. Validate Mobile Uniqueness (Users table)
        const mobileCheck = await client.query('SELECT user_id FROM users WHERE mobile = $1 AND user_id <> $2', [profileData.mobile, userId]);
        if (mobileCheck.rows.length > 0) {
            const err = new Error('Mobile number already in use by another account');
            err.statusCode = 409;
            throw err;
        }

        // 4. Update Customers Table
        const updateCustomersQuery = `
            UPDATE customers
            SET
                customer_title_id = $1,
                gender_id = $2,
                identity_type_id = $3,
                customer_id_number = $4,
                customer_first_name = $5,
                customer_middle_name = $6,
                customer_last_name = $7,
                country_id = $8,
                mobile = $9,
                update_date_time = NOW()
            WHERE user_id = $10
        `;
        await client.query(updateCustomersQuery, [
            profileData.customer_title_id,
            profileData.gender_id || null,
            profileData.identity_type_id,
            profileData.identity_number,
            profileData.first_name,
            profileData.middle_name || null,
            profileData.last_name,
            profileData.country_id,
            profileData.mobile,
            userId
        ]);

        // 5. Update Users Table
        const updateUsersQuery = `
            UPDATE users
            SET
                user_first_name = $1,
                user_middle_name = $2,
                user_last_name = $3,
                mobile = $4,
                country = $5,
                update_date_time = NOW()
            WHERE user_id = $6
        `;
        await client.query(updateUsersQuery, [
            profileData.first_name,
            profileData.middle_name || null,
            profileData.last_name,
            profileData.mobile,
            countryEnglish,
            userId
        ]);

        await client.query('COMMIT');

        // Fetch and return the updated profile
        // Since we are using a separate function, we run it after commit
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    return await getCustomerProfileByUserId(userId);
};

/**
 * Update Customer Profile Image
 */
const updateProfileImage = async (userId, newImageUrl) => {
    // We update the users table directly since profile_image_url is stored there
    const client = await pool.connect();
    let oldImageUrl = null;

    try {
        await client.query('BEGIN');

        const res = await client.query('SELECT profile_image_url FROM users WHERE user_id = $1 FOR UPDATE', [userId]);
        if (res.rows.length === 0) {
            throw new Error('User not found');
        }
        oldImageUrl = res.rows[0].profile_image_url;

        await client.query('UPDATE users SET profile_image_url = $1, update_date_time = NOW() WHERE user_id = $2', [newImageUrl, userId]);

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    return oldImageUrl;
};

/**
 * Get User Password Hash by User ID
 */
const getPasswordHashByUserId = async (userId) => {
    const query = `
        SELECT password_hash 
        FROM users 
        WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0]?.password_hash || null;
};

/**
 * Update User Password Hash
 */
const updateUserPassword = async (userId, newPasswordHash) => {
    const query = `
        UPDATE users 
        SET password_hash = $1, update_date_time = NOW() 
        WHERE user_id = $2
    `;
    await pool.query(query, [newPasswordHash, userId]);
};

/**
 * Get Customer Dashboard Summary by User ID
 */
const getDashboardSummaryByUserId = async (userId) => {
    const query = `
        WITH customer_data AS (
            SELECT customer_id FROM customers WHERE user_id = $1
        ),
        prop_stats AS (
            SELECT 
                COUNT(DISTINCT p.property_id) AS total_properties,
                COUNT(DISTINCT CASE WHEN 
                    pa.is_active = true AND ast.approval_stage_english = 'Approved' AND
                    ps.is_active = true AND pst.status_english = 'Active' AND
                    pd.is_active = true AND pdt.demand_type_english = 'Sale'
                THEN p.property_id END) AS for_sale,
                COUNT(DISTINCT CASE WHEN 
                    pa.is_active = true AND ast.approval_stage_english = 'Approved' AND
                    ps.is_active = true AND pst.status_english = 'Active' AND
                    pd.is_active = true AND pdt.demand_type_english = 'Rent'
                THEN p.property_id END) AS for_rent
            FROM customer_data cd
            LEFT JOIN properties p ON p.customer_id = cd.customer_id
            LEFT JOIN property_approvals pa ON pa.property_id = p.property_id
            LEFT JOIN approval_stages ast ON ast.approval_stage_id = pa.approval_stage_id
            LEFT JOIN property_status ps ON ps.property_id = p.property_id
            LEFT JOIN property_status_types pst ON pst.status_id = ps.status_id
            LEFT JOIN property_demand pd ON pd.property_id = p.property_id
            LEFT JOIN property_demand_types pdt ON pdt.demand_type_id = pd.demand_type_id
        ),
        req_stats AS (
            SELECT COUNT(cr.request_id) AS service_requests
            FROM customer_data cd
            LEFT JOIN customer_requests cr ON cr.customer_id = cd.customer_id
            WHERE cr.service_id IS NOT NULL
        )
        SELECT 
            COALESCE(ps.for_sale, 0)::int AS "forSale",
            COALESCE(ps.for_rent, 0)::int AS "forRent",
            COALESCE(rs.service_requests, 0)::int AS "serviceRequests",
            COALESCE(ps.total_properties, 0)::int AS "totalProperties"
        FROM (SELECT * FROM prop_stats) ps
        FULL OUTER JOIN (SELECT * FROM req_stats) rs ON true;
    `;
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
        return { forSale: 0, forRent: 0, serviceRequests: 0, totalProperties: 0 };
    }
    return result.rows[0];
};

/**
 * Get Customer Dashboard Properties by User ID
 */
const getDashboardPropertiesByUserId = async (userId) => {
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
        WHERE cu.user_id = $1
        ORDER BY p.creation_date_time DESC
        LIMIT 3;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

/**
 * Get all Customer Properties by User ID
 */
const getCustomerPropertiesByUserId = async (userId) => {
    const query = `
        SELECT 
            p.property_id,
            'PRP-' || LPAD(p.property_id::text, 3, '0') AS formatted_id,
            pt.property_type_description AS property_type,
            pu.property_use_description AS property_use,
            s.society_english AS society,
            c.city_english AS city,
            pr.province_english AS province,
            p.property_size,
            u.uom_english AS size_uom,
            p.property_rooms AS rooms,
            p.property_bath_rooms AS bathrooms,
            p.property_floors AS floors,
            p.property_description,
            pst.status_english AS current_status,
            aps.approval_stage_english AS approval_stage,
            pdt.demand_type_english AS demand_type,
            pp.picture_url AS image_url,
            (SELECT COUNT(*) FROM property_pictures pp2 WHERE pp2.property_id = p.property_id AND pp2.is_active = true) AS total_photos,
            p.creation_date_time
        FROM customers cu
        JOIN properties p ON p.customer_id = cu.customer_id
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN property_use pu ON p.property_use_id = pu.property_use_id
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
        LEFT JOIN property_approvals pa ON pa.property_id = p.property_id AND pa.is_active = true
        LEFT JOIN approval_stages aps ON pa.approval_stage_id = aps.approval_stage_id
        LEFT JOIN property_demand pd ON pd.property_id = p.property_id AND pd.is_active = true
        LEFT JOIN property_demand_types pdt ON pd.demand_type_id = pdt.demand_type_id
        LEFT JOIN property_pictures pp ON pp.property_id = p.property_id AND pp.is_active = true AND pp.display_order = 1
        WHERE cu.user_id = $1
        ORDER BY p.creation_date_time DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

/**
 * Add a new Property (POST /api/v1/customer/properties)
 */
const addProperty = async (userId, data) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get customer_id from user_id
        const customerRes = await client.query('SELECT customer_id FROM customers WHERE user_id = $1 AND is_active = true', [userId]);
        if (customerRes.rowCount === 0) {
            throw new Error('Customer profile not found or inactive');
        }
        const customerId = customerRes.rows[0].customer_id;

        // 2. Validate hierarchy using higher IDs if provided
        let hierarchyQuery = `
            SELECT a.area_id
            FROM areas a
            JOIN societies s ON a.society_id = s.society_id
            JOIN cities c ON s.city_id = c.city_id
            JOIN tehsils t ON c.tehsil_id = t.tehsil_id
            JOIN districts d ON t.district_id = d.district_id
            JOIN divisions dv ON d.division_id = dv.division_id
            JOIN provinces p ON dv.province_id = p.province_id
            JOIN countries co ON p.country_id = co.country_id
            WHERE a.area_id = $1
        `;
        const hierarchyParams = [data.area_id];
        let paramIdx = 2;

        if (data.society_id) { hierarchyQuery += ` AND s.society_id = $${paramIdx++}`; hierarchyParams.push(data.society_id); }
        if (data.city_id) { hierarchyQuery += ` AND c.city_id = $${paramIdx++}`; hierarchyParams.push(data.city_id); }
        if (data.tehsil_id) { hierarchyQuery += ` AND t.tehsil_id = $${paramIdx++}`; hierarchyParams.push(data.tehsil_id); }
        if (data.district_id) { hierarchyQuery += ` AND d.district_id = $${paramIdx++}`; hierarchyParams.push(data.district_id); }
        if (data.division_id) { hierarchyQuery += ` AND dv.division_id = $${paramIdx++}`; hierarchyParams.push(data.division_id); }
        if (data.province_id) { hierarchyQuery += ` AND p.province_id = $${paramIdx++}`; hierarchyParams.push(data.province_id); }
        if (data.country_id) { hierarchyQuery += ` AND co.country_id = $${paramIdx++}`; hierarchyParams.push(data.country_id); }

        const hierarchyRes = await client.query(hierarchyQuery, hierarchyParams);
        if (hierarchyRes.rowCount === 0) {
            throw new Error('Invalid geographic hierarchy combination.');
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
            data.rooms || null,
            data.bathrooms || null,
            data.floors || null,
            data.lounges || null,
            data.kitchens || null,
            data.drawingRooms || null,
            data.roadFrontFt || null,
            data.roadBackFt || null,
            data.roadLeftFt || null,
            data.roadRightFt || null,
            data.swimmingPool || false,
            data.mediaRoom || false,
            data.solarInstalled || false,
            data.solarCapacity || null,
            data.electricMeters || null,
            data.gasMeters || null,
            data.propertyDescription || null,
            userId
        ];

        const propRes = await client.query(propertyInsertQuery, propertyParams);
        const propertyId = propRes.rows[0].property_id;

        // 4. Handle Amenities
        if (data.amenities && Array.isArray(data.amenities)) {
            for (let amenityText of data.amenities) {
                if (!amenityText) continue;
                const cleanText = amenityText.trim();
                if (cleanText === '') continue;

                // EXACT match case-insensitive
                const amCheck = await client.query('SELECT amenity_id FROM amenities WHERE LOWER(amenity_description) = LOWER($1)', [cleanText]);
                let amenityId;
                if (amCheck.rowCount > 0) {
                    amenityId = amCheck.rows[0].amenity_id;
                } else {
                    const amInsert = await client.query('INSERT INTO amenities (amenity_description, is_active) VALUES ($1, true) RETURNING amenity_id', [cleanText]);
                    amenityId = amInsert.rows[0].amenity_id;
                }

                // Link
                await client.query(`
                    INSERT INTO property_amenities (property_id, amenity_id, is_active) 
                    VALUES ($1, $2, true) 
                    ON CONFLICT ON CONSTRAINT uq_property_amenity DO NOTHING
                `, [propertyId, amenityId]);
            }
        }

        // 5. Automatic Approval
        const stageRes = await client.query('SELECT approval_stage_id FROM approval_stages WHERE approval_stage_english = $1 AND is_active = true', ['Pending']);
        if (stageRes.rowCount === 0) throw new Error('Pending approval stage not found');
        const approvalStageId = stageRes.rows[0].approval_stage_id;

        await client.query(`
            INSERT INTO property_approvals (property_id, approval_stage_id, effective_date, created_by_user, creation_date_time, update_date_time, is_active)
            VALUES ($1, $2, CURRENT_DATE, $3, NOW(), NOW(), true)
        `, [propertyId, approvalStageId, userId]);

        // 6. Automatic Status
        const statusRes = await client.query('SELECT status_id FROM property_status_types WHERE status_english = $1 AND is_active = true', ['Inactive']);
        if (statusRes.rowCount === 0) throw new Error('Inactive status type not found');
        const statusId = statusRes.rows[0].status_id;

        await client.query(`
            INSERT INTO property_status (property_id, status_id, effective_date, created_by_user, creation_date_time, update_date_time, is_active)
            VALUES ($1, $2, CURRENT_DATE, $3, NOW(), NOW(), true)
        `, [propertyId, statusId, userId]);

        await client.query('COMMIT');
        return propertyId;

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const updateProperty = async (propertyId, customerId, data) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Lock property row
        const lockRes = await client.query(
            'SELECT property_id FROM properties WHERE property_id = $1 AND customer_id = $2 FOR UPDATE',
            [propertyId, customerId]
        );
        if (lockRes.rowCount === 0) {
            throw new Error('Property not found or unauthorized.');
        }

        // 2. Validate Geographic Hierarchy
        let hierarchyQuery = `
            SELECT 1 
            FROM areas a
            LEFT JOIN societies s ON a.society_id = s.society_id
            LEFT JOIN cities c ON s.city_id = c.city_id
            LEFT JOIN tehsils t ON c.tehsil_id = t.tehsil_id
            LEFT JOIN districts d ON t.district_id = d.district_id
            LEFT JOIN divisions dv ON d.division_id = dv.division_id
            LEFT JOIN provinces p ON dv.province_id = p.province_id
            LEFT JOIN countries co ON p.country_id = co.country_id
            WHERE a.area_id = $1
        `;
        const hierarchyParams = [data.area_id];
        let paramIdx = 2;

        if (data.society_id) { hierarchyQuery += ` AND s.society_id = $${paramIdx++}`; hierarchyParams.push(data.society_id); }
        if (data.city_id) { hierarchyQuery += ` AND c.city_id = $${paramIdx++}`; hierarchyParams.push(data.city_id); }
        if (data.tehsil_id) { hierarchyQuery += ` AND t.tehsil_id = $${paramIdx++}`; hierarchyParams.push(data.tehsil_id); }
        if (data.district_id) { hierarchyQuery += ` AND d.district_id = $${paramIdx++}`; hierarchyParams.push(data.district_id); }
        if (data.division_id) { hierarchyQuery += ` AND dv.division_id = $${paramIdx++}`; hierarchyParams.push(data.division_id); }
        if (data.province_id) { hierarchyQuery += ` AND p.province_id = $${paramIdx++}`; hierarchyParams.push(data.province_id); }
        if (data.country_id) { hierarchyQuery += ` AND co.country_id = $${paramIdx++}`; hierarchyParams.push(data.country_id); }

        const hierarchyRes = await client.query(hierarchyQuery, hierarchyParams);
        if (hierarchyRes.rowCount === 0) {
            throw new Error('Invalid geographic hierarchy combination.');
        }

        // 3. Update Property Scalar Fields
        const propertyUpdateQuery = `
            UPDATE properties SET
                area_id = $2, property_type_id = $3, property_use_id = $4, property_location_id = $5,
                property_size = $6, property_size_uom = $7, property_marla_size_id = $8,
                property_area_marla = $9, property_area_kanal = $10, property_area_acre = $11, property_area_sqft = $12, property_area_sqyard = $13,
                property_size_front = $14, property_size_back = $15, property_size_left = $16, property_size_right = $17,
                property_covered_area_sqft = $18, property_open_area_sqft = $19,
                property_rooms = $20, property_bath_rooms = $21, property_floors = $22, property_lounges = $23, property_kitchens = $24, property_drawing_rooms = $25,
                property_road_size_front_ft = $26, property_road_size_back_ft = $27, property_road_size_left_ft = $28, property_road_size_right_ft = $29,
                property_swimming_pool = $30, property_media_room = $31, property_solar_is_installed = $32, property_solar_capacity = $33,
                property_electric_meters = $34, property_gas_meters = $35, property_description = $36,
                update_date_time = NOW()
            WHERE property_id = $1
        `;

        const propertyParams = [
            propertyId,
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
            data.rooms || null,
            data.bathrooms || null,
            data.floors || null,
            data.lounges || null,
            data.kitchens || null,
            data.drawingRooms || null,
            data.roadFrontFt || null,
            data.roadBackFt || null,
            data.roadLeftFt || null,
            data.roadRightFt || null,
            data.swimmingPool || false,
            data.mediaRoom || false,
            data.solarInstalled || false,
            data.solarCapacity || null,
            data.electricMeters || null,
            data.gasMeters || null,
            data.propertyDescription || null
        ];

        await client.query(propertyUpdateQuery, propertyParams);

        // 4. Handle Amenities
        if (data.amenities && Array.isArray(data.amenities)) {
            // Remove existing links
            await client.query('DELETE FROM property_amenities WHERE property_id = $1', [propertyId]);
            
            for (let amenityText of data.amenities) {
                if (!amenityText) continue;
                const cleanText = amenityText.trim();
                if (cleanText === '') continue;

                // EXACT match case-insensitive
                const amCheck = await client.query('SELECT amenity_id FROM amenities WHERE LOWER(amenity_description) = LOWER($1)', [cleanText]);
                let amenityId;
                if (amCheck.rowCount > 0) {
                    amenityId = amCheck.rows[0].amenity_id;
                } else {
                    const amInsert = await client.query('INSERT INTO amenities (amenity_description, is_active) VALUES ($1, true) RETURNING amenity_id', [cleanText]);
                    amenityId = amInsert.rows[0].amenity_id;
                }

                // Link
                await client.query(`
                    INSERT INTO property_amenities (property_id, amenity_id, is_active) 
                    VALUES ($1, $2, true) 
                    ON CONFLICT ON CONSTRAINT uq_property_amenity DO NOTHING
                `, [propertyId, amenityId]);
            }
        }

        await client.query('COMMIT');
        return true;

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// --------------------------------------------------------------------------
// Upload Property Pictures
// --------------------------------------------------------------------------

/**
 * Inserts uploaded picture records for a property inside one transaction.
 * Uses a SELECT ... FOR UPDATE lock on the property row to prevent race
 * conditions on display_order calculation.
 *
 * @param {number}   propertyId   - Verified property ID
 * @param {number}   userId       - req.user.user_id (created_by_user)
 * @param {string[]} pictureUrls  - Relative public URLs of saved files
 * @returns {Array}  Inserted picture rows ({ property_picture_id, picture_url, display_order })
 */
const uploadPropertyPictures = async (propertyId, userId, pictureUrls) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Lock property row to serialise concurrent uploads
        await client.query(
            'SELECT property_id FROM properties WHERE property_id = $1 FOR UPDATE',
            [propertyId]
        );

        // 2. Count existing active pictures
        const countResult = await client.query(
            'SELECT COUNT(*) AS cnt FROM property_pictures WHERE property_id = $1 AND is_active = true',
            [propertyId]
        );
        const existingCount = parseInt(countResult.rows[0].cnt, 10);

        const MAX = 6;
        if (existingCount + pictureUrls.length > MAX) {
            await client.query('ROLLBACK');
            const err = new Error(`Maximum ${MAX} pictures are allowed per property.`);
            err.statusCode = 400;
            throw err;
        }

        // 3. Determine starting display_order
        const maxOrderResult = await client.query(
            'SELECT COALESCE(MAX(display_order), 0) AS max_order FROM property_pictures WHERE property_id = $1 AND is_active = true',
            [propertyId]
        );
        let nextOrder = parseInt(maxOrderResult.rows[0].max_order, 10) + 1;

        // 4. Insert each picture
        const insertedPictures = [];
        for (const url of pictureUrls) {
            const insertResult = await client.query(
                `INSERT INTO property_pictures
                    (property_id, picture_url, picture_description, display_order,
                     created_by_user, creation_date_time, update_date_time,
                     is_active, gps_coordinates, url_used)
                 VALUES ($1, $2, NULL, $3, $4, NOW(), NOW(), true, NULL, NULL)
                 RETURNING property_picture_id, picture_url, display_order`,
                [propertyId, url, nextOrder, userId]
            );
            insertedPictures.push(insertResult.rows[0]);
            nextOrder++;
        }

        await client.query('COMMIT');
        return insertedPictures;

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// --------------------------------------------------------------------------
// Upload Property Video
// --------------------------------------------------------------------------

/**
 * Inserts a single video record for a property inside one transaction.
 * Uses SELECT ... FOR UPDATE to prevent concurrent uploads from bypassing
 * the one-active-video-per-property business limit.
 *
 * @param {number} propertyId  - Verified property ID
 * @param {number} userId      - req.user.user_id (created_by_user)
 * @param {string} videoUrl    - Relative public URL of the saved file
 * @returns {{ property_video_id, video_url, display_order }}
 */
const uploadPropertyVideo = async (propertyId, userId, videoUrl) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Lock property row to serialise concurrent uploads
        await client.query(
            'SELECT property_id FROM properties WHERE property_id = $1 FOR UPDATE',
            [propertyId]
        );

        // 2. Enforce one-active-video-per-property limit
        const countResult = await client.query(
            'SELECT COUNT(*) AS cnt FROM property_videos WHERE property_id = $1 AND is_active = true',
            [propertyId]
        );
        const existingCount = parseInt(countResult.rows[0].cnt, 10);

        if (existingCount >= 1) {
            await client.query('ROLLBACK');
            const err = new Error('Maximum 1 video is allowed per property.');
            err.statusCode = 400;
            throw err;
        }

        // 3. Insert video record (display_order is always 1 — only one active video allowed)
        const insertResult = await client.query(
            `INSERT INTO property_videos
                (property_id, video_url, video_description, display_order,
                 created_by_user, creation_date_time, update_date_time,
                 is_active, gps_coordinates, url_used)
             VALUES ($1, $2, NULL, 1, $3, NOW(), NOW(), true, NULL, NULL)
             RETURNING property_video_id, video_url, display_order`,
            [propertyId, videoUrl, userId]
        );

        await client.query('COMMIT');
        return insertResult.rows[0];

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
// --------------------------------------------------------------------------
// Get Single Property Detail (owner-verified)
// --------------------------------------------------------------------------

/**
 * Fetch full property details for a single property that belongs to the
 * authenticated customer.
 *
 * @param {number} propertyId  - Validated property ID from route param
 * @param {number} userId      - req.user.user_id
 * @returns {object|null}      - Structured detail object or null if not found / not owned
 */
const getPropertyDetailByIdAndUserId = async (propertyId, userId) => {
    const client = await pool.connect();
    try {
        // ----------------------------------------------------------------
        // 1. Core property row + resolved descriptions (ownership enforced)
        // ----------------------------------------------------------------
        const propertyQuery = `
            SELECT
                p.property_id,
                'PRP-' || LPAD(p.property_id::text, 3, '0') AS formatted_id,

                -- Classification
                p.property_type_id,
                pt.property_type_description,
                p.property_use_id,
                pu.property_use_description,
                p.property_location_id,
                pl.property_location_description,

                -- Size
                p.property_size,
                p.property_size_uom,
                u.uom_english,
                p.property_marla_size_id,
                ms.marla_size_sqft,
                p.property_area_marla,
                p.property_area_kanal,
                p.property_area_acre,
                p.property_area_sqft,
                p.property_area_sqyard,
                p.property_covered_area_sqft,
                p.property_open_area_sqft,
                p.property_size_front,
                p.property_size_back,
                p.property_size_left,
                p.property_size_right,

                -- Particulars
                p.property_rooms,
                p.property_bath_rooms,
                p.property_floors,
                p.property_lounges,
                p.property_kitchens,
                p.property_drawing_rooms,

                -- Road access
                p.property_road_size_front_ft,
                p.property_road_size_back_ft,
                p.property_road_size_left_ft,
                p.property_road_size_right_ft,

                -- Features
                p.property_swimming_pool,
                p.property_media_room,
                p.property_solar_is_installed,
                p.property_solar_capacity,
                p.property_electric_meters,
                p.property_gas_meters,
                p.property_description,

                -- Timestamps
                p.creation_date_time,
                p.update_date_time,
                p.is_active,

                -- Location chain via area_id
                a.area_id,
                a.area_english,
                s.society_id,
                s.society_english,
                c.city_id,
                c.city_english,
                t.tehsil_id,
                t.tehsil_english,
                d.district_id,
                d.district_english,
                dv.division_id,
                dv.division_english,
                pr.province_id,
                pr.province_english,
                co.country_id,
                co.country_english

            FROM properties p
            JOIN customers cu ON p.customer_id = cu.customer_id
            LEFT JOIN property_types pt       ON p.property_type_id     = pt.property_type_id
            LEFT JOIN property_use pu         ON p.property_use_id      = pu.property_use_id
            LEFT JOIN property_locations pl   ON p.property_location_id = pl.property_location_id
            LEFT JOIN uom u                   ON p.property_size_uom    = u.uom_id
            LEFT JOIN marla_sizes ms          ON p.property_marla_size_id = ms.marla_id
            LEFT JOIN areas a                 ON p.area_id              = a.area_id
            LEFT JOIN societies s             ON a.society_id           = s.society_id
            LEFT JOIN cities c               ON s.city_id              = c.city_id
            LEFT JOIN tehsils t              ON c.tehsil_id            = t.tehsil_id
            LEFT JOIN districts d            ON t.district_id          = d.district_id
            LEFT JOIN divisions dv           ON d.division_id          = dv.division_id
            LEFT JOIN provinces pr           ON dv.province_id         = pr.province_id
            LEFT JOIN countries co           ON pr.country_id          = co.country_id
            WHERE p.property_id = $1
              AND cu.user_id    = $2
        `;

        const propResult = await client.query(propertyQuery, [propertyId, userId]);
        if (propResult.rowCount === 0) return null;
        const row = propResult.rows[0];

        // ----------------------------------------------------------------
        // 2. Pictures (active, ordered)
        // ----------------------------------------------------------------
        const picResult = await client.query(
            `SELECT property_picture_id, picture_url, picture_description, display_order
             FROM property_pictures
             WHERE property_id = $1 AND is_active = true
             ORDER BY display_order ASC`,
            [propertyId]
        );

        // ----------------------------------------------------------------
        // 3. Video (single active)
        // ----------------------------------------------------------------
        const vidResult = await client.query(
            `SELECT property_video_id, video_url, video_description, display_order
             FROM property_videos
             WHERE property_id = $1 AND is_active = true
             LIMIT 1`,
            [propertyId]
        );

        // ----------------------------------------------------------------
        // 4. Amenities (active, distinct)
        // ----------------------------------------------------------------
        const amenResult = await client.query(
            `SELECT DISTINCT am.amenity_id, am.amenity_description
             FROM property_amenities pa
             JOIN amenities am ON pa.amenity_id = am.amenity_id
             WHERE pa.property_id = $1 AND pa.is_active = true
             ORDER BY am.amenity_description`,
            [propertyId]
        );

        // ----------------------------------------------------------------
        // 5. Approval (current active)
        // ----------------------------------------------------------------
        const approvalResult = await client.query(
            `SELECT
                pa.property_approval_id,
                ast.approval_stage_english AS approval_stage,
                pa.effective_date,
                pa.approval_remarks
             FROM property_approvals pa
             JOIN approval_stages ast ON pa.approval_stage_id = ast.approval_stage_id
             WHERE pa.property_id = $1 AND pa.is_active = true
             LIMIT 1`,
            [propertyId]
        );

        // ----------------------------------------------------------------
        // 6. Status (current active)
        // ----------------------------------------------------------------
        const statusResult = await client.query(
            `SELECT
                ps.property_status_id,
                pst.status_english AS status,
                ps.effective_date,
                ps.status_remarks
             FROM property_status ps
             JOIN property_status_types pst ON ps.status_id = pst.status_id
             WHERE ps.property_id = $1 AND ps.is_active = true
             LIMIT 1`,
            [propertyId]
        );

        // ----------------------------------------------------------------
        // 7. Demand (current active)
        // ----------------------------------------------------------------
        const demandResult = await client.query(
            `SELECT
                pd.demand_id,
                pdt.demand_type_english AS demand_type,
                pd.demand_amount,
                pd.discount_percent,
                pd.discount_amount,
                pd.final_amount,
                pd.effective_date
             FROM property_demand pd
             JOIN property_demand_types pdt ON pd.demand_type_id = pdt.demand_type_id
             WHERE pd.property_id = $1 AND pd.is_active = true
             LIMIT 1`,
            [propertyId]
        );

        // ----------------------------------------------------------------
        // Assemble response
        // ----------------------------------------------------------------
        return {
            property: {
                property_id: row.property_id,
                formatted_id: row.formatted_id,
                property_type_id: row.property_type_id,
                property_type: row.property_type_description,
                property_use_id: row.property_use_id,
                property_use: row.property_use_description,
                property_location_id: row.property_location_id,
                property_location: row.property_location_description,
                property_size: row.property_size,
                property_size_uom: row.property_size_uom,
                uom_english: row.uom_english,
                property_marla_size_id: row.property_marla_size_id,
                marla_size_sqft: row.marla_size_sqft,
                property_area_marla: row.property_area_marla,
                property_area_kanal: row.property_area_kanal,
                property_area_acre: row.property_area_acre,
                property_area_sqft: row.property_area_sqft,
                property_area_sqyard: row.property_area_sqyard,
                property_covered_area_sqft: row.property_covered_area_sqft,
                property_open_area_sqft: row.property_open_area_sqft,
                property_size_front: row.property_size_front,
                property_size_back: row.property_size_back,
                property_size_left: row.property_size_left,
                property_size_right: row.property_size_right,
                property_rooms: row.property_rooms,
                property_bath_rooms: row.property_bath_rooms,
                property_floors: row.property_floors,
                property_lounges: row.property_lounges,
                property_kitchens: row.property_kitchens,
                property_drawing_rooms: row.property_drawing_rooms,
                property_road_size_front_ft: row.property_road_size_front_ft,
                property_road_size_back_ft: row.property_road_size_back_ft,
                property_road_size_left_ft: row.property_road_size_left_ft,
                property_road_size_right_ft: row.property_road_size_right_ft,
                property_swimming_pool: row.property_swimming_pool,
                property_media_room: row.property_media_room,
                property_solar_is_installed: row.property_solar_is_installed,
                property_solar_capacity: row.property_solar_capacity,
                property_electric_meters: row.property_electric_meters,
                property_gas_meters: row.property_gas_meters,
                property_description: row.property_description,
                creation_date_time: row.creation_date_time,
                update_date_time: row.update_date_time,
                is_active: row.is_active
            },
            location: {
                area_id: row.area_id,
                area_english: row.area_english,
                society_id: row.society_id,
                society_english: row.society_english,
                city_id: row.city_id,
                city_english: row.city_english,
                tehsil_id: row.tehsil_id,
                tehsil_english: row.tehsil_english,
                district_id: row.district_id,
                district_english: row.district_english,
                division_id: row.division_id,
                division_english: row.division_english,
                province_id: row.province_id,
                province_english: row.province_english,
                country_id: row.country_id,
                country_english: row.country_english
            },
            pictures: picResult.rows,
            video: vidResult.rowCount > 0 ? vidResult.rows[0] : null,
            amenities: amenResult.rows,
            approval: approvalResult.rowCount > 0 ? approvalResult.rows[0] : null,
            status: statusResult.rowCount > 0 ? statusResult.rows[0] : null,
            demand: demandResult.rowCount > 0 ? demandResult.rows[0] : null
        };

    } finally {
        client.release();
    }
};

/**
 * Add or Update Property Demand (Pricing)
 */
const addPropertyDemand = async (propertyId, customerId, userId, demandTypeId, demandAmount) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Lock property and verify ownership explicitly
        const propertyCheck = await client.query(
            'SELECT property_id FROM properties WHERE property_id = $1 AND customer_id = $2 FOR UPDATE',
            [propertyId, customerId]
        );
        if (propertyCheck.rowCount === 0) {
            throw Object.assign(new Error('Property not found or you do not have permission.'), { statusCode: 403 });
        }

        // 2. Resolve PKR currency ID
        const currencyResult = await client.query(
            "SELECT currency_id FROM currencies WHERE currency_code = 'PKR'"
        );
        if (currencyResult.rowCount === 0) {
            throw Object.assign(new Error('PKR currency is not configured in the system.'), { statusCode: 500 });
        }
        const currencyId = currencyResult.rows[0].currency_id;

        // 3. Validate Demand Type
        const demandTypeResult = await client.query(
            'SELECT demand_type_english FROM property_demand_types WHERE demand_type_id = $1 AND is_active = true',
            [demandTypeId]
        );
        if (demandTypeResult.rowCount === 0) {
            throw Object.assign(new Error('Invalid or inactive demand type.'), { statusCode: 400 });
        }
        const demandTypeEnglish = demandTypeResult.rows[0].demand_type_english;

        // 4. Fetch previous active demand
        const previousDemandResult = await client.query(
            'SELECT demand_id, demand_type_id, demand_amount, final_amount FROM property_demand WHERE property_id = $1 AND is_active = true FOR UPDATE',
            [propertyId]
        );
        const previousDemand = previousDemandResult.rowCount > 0 ? previousDemandResult.rows[0] : null;

        // 5. Calculate new values
        let insertDemandAmount = demandAmount;
        let insertDiscountAmount = null;
        let insertDiscountPercent = null;
        let insertFinalAmount = demandAmount;

        if (previousDemand) {
            // Same type -> Calculate reduction if any
            if (previousDemand.demand_type_id === demandTypeId) {
                const previousCurrentPrice = Number(previousDemand.final_amount ?? previousDemand.demand_amount);
                const newEnteredPrice = Number(demandAmount);

                if (newEnteredPrice < previousCurrentPrice) {
                    insertDemandAmount = previousCurrentPrice; // Store old price as base for discount
                    insertDiscountAmount = previousCurrentPrice - newEnteredPrice;
                    insertDiscountPercent = (insertDiscountAmount / previousCurrentPrice) * 100;
                    insertFinalAmount = newEnteredPrice;
                } else {
                    // Increase or same price -> fresh baseline
                    insertDemandAmount = newEnteredPrice;
                    insertDiscountAmount = null;
                    insertDiscountPercent = null;
                    insertFinalAmount = newEnteredPrice;
                }
            } else {
                // Sale ↔ Rent change -> fresh baseline (no discount calculated)
                insertDemandAmount = demandAmount;
                insertDiscountAmount = null;
                insertDiscountPercent = null;
                insertFinalAmount = demandAmount;
            }

            // Invalidate previous active demand
            await client.query(
                'UPDATE property_demand SET is_active = false, update_date_time = NOW() WHERE demand_id = $1',
                [previousDemand.demand_id]
            );
        }

        // 6. Insert new demand
        const insertResult = await client.query(
            `INSERT INTO property_demand (
                property_id,
                customer_id,
                effective_date,
                demand_currency_id,
                demand_amount,
                discount_amount,
                discount_percent,
                final_amount,
                demand_type_id,
                created_by_user,
                creation_date_time,
                update_date_time,
                is_active
            ) VALUES (
                $1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), true
            ) RETURNING demand_id, effective_date`,
            [
                propertyId,
                customerId,
                currencyId,
                insertDemandAmount,
                insertDiscountAmount,
                insertDiscountPercent,
                insertFinalAmount,
                demandTypeId,
                userId
            ]
        );

        const newDemandRow = insertResult.rows[0];

        await client.query('COMMIT');

        return {
            demand_id: newDemandRow.demand_id,
            property_id: propertyId,
            demand_type_id: demandTypeId,
            demand_type: demandTypeEnglish,
            demand_amount: insertDemandAmount,
            discount_amount: insertDiscountAmount,
            discount_percent: insertDiscountPercent,
            final_amount: insertFinalAmount,
            effective_date: newDemandRow.effective_date,
            currency_code: 'PKR',
            is_active: true
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    getCustomerProfileByUserId,
    updateCustomerProfileByUserId,
    updateProfileImage,
    getPasswordHashByUserId,
    updateUserPassword,
    getDashboardSummaryByUserId,
    getDashboardPropertiesByUserId,
    getCustomerPropertiesByUserId,
    addProperty,
    updateProperty,
    uploadPropertyPictures,
    uploadPropertyVideo,
    getPropertyDetailByIdAndUserId,
    addPropertyDemand
};
