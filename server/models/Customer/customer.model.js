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
        LEFT JOIN societies s ON p.society_id = s.society_id
        LEFT JOIN cities c ON s.city_id = c.city_id
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
        LEFT JOIN societies s ON p.society_id = s.society_id
        LEFT JOIN cities c ON s.city_id = c.city_id
        LEFT JOIN districts d ON p.property_district_id = d.district_id
        LEFT JOIN provinces pr ON d.province_id = pr.province_id
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

module.exports = {
    getCustomerProfileByUserId,
    updateCustomerProfileByUserId,
    updateProfileImage,
    getPasswordHashByUserId,
    updateUserPassword,
    getDashboardSummaryByUserId,
    getDashboardPropertiesByUserId,
    getCustomerPropertiesByUserId
};
