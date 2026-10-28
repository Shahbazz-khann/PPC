const validateGetSocieties = (req, res, next) => {
    let { search, status, districtId, tehsilId, cityId, page, limit } = req.query;

    const errors = [];

    // Search validation
    if (search !== undefined) {
        if (typeof search !== 'string') {
            errors.push('Search must be a string');
        } else {
            search = search.trim();
            if (search === '') {
                delete req.query.search;
            } else {
                req.query.search = search;
            }
        }
    }

    // Status validation
    if (status !== undefined) {
        if (typeof status !== 'string') {
            errors.push('Status must be a string');
        } else {
            status = status.trim().toLowerCase();
            if (!['active', 'inactive', 'all'].includes(status)) {
                errors.push('Status must be active, inactive, or all');
            } else {
                req.query.status = status;
            }
        }
    } else {
        req.query.status = 'all';
    }

    // District ID
    if (districtId !== undefined) {
        if (typeof districtId !== 'string') {
            errors.push('District ID must be a string');
        } else {
            districtId = districtId.trim();
            if (districtId === '') {
                delete req.query.districtId;
            } else if (!/^[1-9]\d*$/.test(districtId)) {
                errors.push('Invalid District ID format');
            } else {
                req.query.districtId = districtId;
            }
        }
    }

    // Tehsil ID
    if (tehsilId !== undefined) {
        if (typeof tehsilId !== 'string') {
            errors.push('Tehsil ID must be a string');
        } else {
            tehsilId = tehsilId.trim();
            if (tehsilId === '') {
                delete req.query.tehsilId;
            } else if (!/^[1-9]\d*$/.test(tehsilId)) {
                errors.push('Invalid Tehsil ID format');
            } else {
                req.query.tehsilId = tehsilId;
            }
        }
    }

    // City ID
    if (cityId !== undefined) {
        if (typeof cityId !== 'string') {
            errors.push('City ID must be a string');
        } else {
            cityId = cityId.trim();
            if (cityId === '') {
                delete req.query.cityId;
            } else if (!/^[1-9]\d*$/.test(cityId)) {
                errors.push('Invalid City ID format');
            } else {
                req.query.cityId = cityId;
            }
        }
    }

    // Page
    if (page !== undefined) {
        const parsedPage = Number(page);
        if (!Number.isInteger(parsedPage) || parsedPage < 1) {
            errors.push('Page must be a positive integer');
        } else {
            req.query.page = parsedPage;
        }
    } else {
        req.query.page = 1;
    }

    // Limit
    if (limit !== undefined) {
        const parsedLimit = Number(limit);
        if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 1000) {
            errors.push('Limit must be an integer between 1 and 1000');
        } else {
            req.query.limit = parsedLimit;
        }
    } else {
        req.query.limit = 10;
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    next();
};

const validateCreateSociety = (req, res, next) => {
    let { city_id, society_english, society_urdu, society_abb } = req.body;
    const errors = [];
    const validatedBody = {};

    // city_id validation
    if (city_id === undefined || city_id === null) {
        errors.push('City ID is required');
    } else if (typeof city_id !== 'string') {
        errors.push('City ID must be a string');
    } else {
        city_id = city_id.trim();
        if (city_id === '') {
            errors.push('City ID is required');
        } else if (!/^[1-9]\d*$/.test(city_id)) {
            errors.push('Invalid City ID format');
        } else {
            validatedBody.city_id = city_id;
        }
    }

    // society_english validation
    if (society_english === undefined || society_english === null) {
        errors.push('English name is required');
    } else if (typeof society_english !== 'string') {
        errors.push('English name must be a string');
    } else {
        society_english = society_english.trim();
        if (society_english === '') {
            errors.push('English name is required');
        } else if (society_english.length > 150) {
            errors.push('English name must not exceed 150 characters');
        } else {
            validatedBody.society_english = society_english;
        }
    }

    // society_urdu validation
    if (society_urdu === undefined || society_urdu === null) {
        validatedBody.society_urdu = null;
    } else if (typeof society_urdu !== 'string') {
        errors.push('Urdu name must be a string');
    } else {
        society_urdu = society_urdu.trim();
        if (society_urdu === '') {
            validatedBody.society_urdu = null;
        } else if (society_urdu.length > 150) {
            errors.push('Urdu name must not exceed 150 characters');
        } else {
            validatedBody.society_urdu = society_urdu;
        }
    }

    // society_abb validation
    if (society_abb === undefined || society_abb === null) {
        validatedBody.society_abb = null;
    } else if (typeof society_abb !== 'string') {
        errors.push('Abbreviation must be a string');
    } else {
        society_abb = society_abb.trim();
        if (society_abb === '') {
            validatedBody.society_abb = null;
        } else if (society_abb.length > 30) {
            errors.push('Abbreviation must not exceed 30 characters');
        } else {
            validatedBody.society_abb = society_abb;
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    req.validatedBody = validatedBody;
    next();
};

const validateSocietyId = (req, res, next) => {
    const { id } = req.params;
    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Society ID format'
        });
    }
    next();
};

const validateUpdateSociety = (req, res, next) => {
    let { city_id, society_english, society_urdu, society_abb, is_active } = req.body;
    const errors = [];
    const validatedBody = {};

    // city_id validation
    if (city_id === undefined || city_id === null) {
        errors.push('City ID is required');
    } else if (typeof city_id !== 'string') {
        errors.push('City ID must be a string');
    } else {
        city_id = city_id.trim();
        if (city_id === '') {
            errors.push('City ID is required');
        } else if (!/^[1-9]\d*$/.test(city_id)) {
            errors.push('Invalid City ID format');
        } else {
            validatedBody.city_id = city_id;
        }
    }

    // society_english validation
    if (society_english === undefined || society_english === null) {
        errors.push('English name is required');
    } else if (typeof society_english !== 'string') {
        errors.push('English name must be a string');
    } else {
        society_english = society_english.trim();
        if (society_english === '') {
            errors.push('English name is required');
        } else if (society_english.length > 150) {
            errors.push('English name must not exceed 150 characters');
        } else {
            validatedBody.society_english = society_english;
        }
    }

    // society_urdu validation
    if (society_urdu === undefined || society_urdu === null) {
        validatedBody.society_urdu = null;
    } else if (typeof society_urdu !== 'string') {
        errors.push('Urdu name must be a string');
    } else {
        society_urdu = society_urdu.trim();
        if (society_urdu === '') {
            validatedBody.society_urdu = null;
        } else if (society_urdu.length > 150) {
            errors.push('Urdu name must not exceed 150 characters');
        } else {
            validatedBody.society_urdu = society_urdu;
        }
    }

    // society_abb validation
    if (society_abb === undefined || society_abb === null) {
        validatedBody.society_abb = null;
    } else if (typeof society_abb !== 'string') {
        errors.push('Abbreviation must be a string');
    } else {
        society_abb = society_abb.trim();
        if (society_abb === '') {
            validatedBody.society_abb = null;
        } else if (society_abb.length > 30) {
            errors.push('Abbreviation must not exceed 30 characters');
        } else {
            validatedBody.society_abb = society_abb;
        }
    }

    // is_active validation
    if (is_active === undefined || is_active === null) {
        errors.push('Status is required');
    } else if (typeof is_active !== 'boolean') {
        errors.push('Status must be a boolean');
    } else {
        validatedBody.is_active = is_active;
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    req.validatedBody = validatedBody;
    next();
};

module.exports = {
    validateGetSocieties,
    validateCreateSociety,
    validateSocietyId,
    validateUpdateSociety
};
