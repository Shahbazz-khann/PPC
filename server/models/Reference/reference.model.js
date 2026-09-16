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

const getProvinces = async () => {
    const query = `
        SELECT province_id, country_id, province_english, province_urdu, province_abb
        FROM provinces
        WHERE is_active = true
        ORDER BY province_english ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getDivisions = async () => {
    const query = `
        SELECT division_id, province_id, division_english, division_urdu, division_abb
        FROM divisions
        WHERE is_active = true
        ORDER BY division_english ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getDistricts = async () => {
    const query = `
        SELECT district_id, division_id, district_english, district_urdu, district_abb
        FROM districts
        WHERE is_active = true
        ORDER BY district_english ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getTehsils = async () => {
    const query = `
        SELECT tehsil_id, district_id, tehsil_english, tehsil_urdu, tehsil_abb
        FROM tehsils
        WHERE is_active = true
        ORDER BY tehsil_english ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getPropertyTypes = async () => {
    const query = `
        SELECT property_type_id, property_type_description, property_type_urdu, property_type_abb
        FROM property_types
        WHERE is_active = true
        ORDER BY property_type_description ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getPropertyUses = async () => {
    const query = `
        SELECT property_use_id, property_use_description, property_use_urdu, property_use_abb
        FROM property_use
        WHERE is_active = true
        ORDER BY property_use_description ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getPropertyLocations = async () => {
    const query = `
        SELECT property_location_id, property_location_description, property_location_urdu, property_location_abb
        FROM property_locations
        WHERE is_active = true
        ORDER BY property_location_description ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getUOM = async () => {
    const query = `
        SELECT uom_id, uom_english, uom_urdu, uom_abb
        FROM uom
        WHERE is_active = true
        ORDER BY uom_english ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getMarlaSizes = async () => {
    const query = `
        SELECT marla_id, marla_size_sqft
        FROM marla_sizes
        WHERE is_active = true
        ORDER BY marla_size_sqft ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getAmenities = async () => {
    const query = `
        SELECT amenity_id, amenity_description, amenity_urdu, amenity_abb
        FROM amenities
        WHERE is_active = true
        ORDER BY amenity_description ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getCities = async (tehsilId, searchStr) => {
    let query = `
        SELECT city_id, tehsil_id, city_english, city_urdu, city_abb
        FROM cities
        WHERE tehsil_id = $1 AND is_active = true
    `;
    const params = [tehsilId];
    if (searchStr) {
        query += ` AND city_english ILIKE $2`;
        params.push(`%${searchStr}%`);
    }
    query += ` ORDER BY city_english ASC`;
    const result = await pool.query(query, params);
    return result.rows;
};

const getSocieties = async (cityId, searchStr) => {
    let query = `
        SELECT society_id, city_id, society_english, society_urdu, society_abb
        FROM societies
        WHERE city_id = $1 AND is_active = true
    `;
    const params = [cityId];
    if (searchStr) {
        query += ` AND society_english ILIKE $2`;
        params.push(`%${searchStr}%`);
    }
    query += ` ORDER BY society_english ASC`;
    const result = await pool.query(query, params);
    return result.rows;
};

const getAreas = async (societyId, searchStr) => {
    let query = `
        SELECT area_id, society_id, area_english, area_urdu, area_abb
        FROM areas
        WHERE society_id = $1 AND is_active = true
    `;
    const params = [societyId];
    if (searchStr) {
        query += ` AND area_english ILIKE $2`;
        params.push(`%${searchStr}%`);
    }
    query += ` ORDER BY area_english ASC`;
    const result = await pool.query(query, params);
    return result.rows;
};

module.exports = {
    getIdentityTypes,
    getCountries,
    getCustomerTitles,
    getGenders,
    getProvinces,
    getDivisions,
    getDistricts,
    getTehsils,
    getPropertyTypes,
    getPropertyUses,
    getPropertyLocations,
    getUOM,
    getMarlaSizes,
    getAmenities,
    getCities,
    getSocieties,
    getAreas
};
