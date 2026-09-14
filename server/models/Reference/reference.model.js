const { pool } = require('../../config/db');

const getIdentityTypes = async () => {
    const query = `
        SELECT identity_type_id, identity_description, identity_urdu, identity_abb
        FROM identity_types
        WHERE is_active = true
        ORDER BY identity_type_id ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getCountries = async () => {
    const query = `
        SELECT country_id, country_english, country_urdu, country_abb
        FROM countries
        WHERE is_active = true
        ORDER BY country_english ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getCustomerTitles = async () => {
    const query = `
        SELECT customer_title_id, title_description, title_urdu, title_abb
        FROM customer_titles
        WHERE is_active = true
        ORDER BY customer_title_id ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getGenders = async () => {
    const query = `
        SELECT gender_id, gender_english, gender_urdu, gender_abb
        FROM genders
        WHERE is_active = true
        ORDER BY gender_id ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

module.exports = {
    getIdentityTypes,
    getCountries,
    getCustomerTitles,
    getGenders
};
