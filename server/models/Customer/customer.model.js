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

module.exports = {
    getCustomerProfileByUserId,
    updateCustomerProfileByUserId,
    updateProfileImage,
    getPasswordHashByUserId,
    updateUserPassword
};
