const validateGetCities = (req, res, next) => {
    let { search, status, countryId, provinceId, divisionId, districtId, tehsilId, page, limit } = req.query;

    const errors = [];
    const validatedQuery = {};

    // Search validation
    if (search !== undefined) {
        if (typeof search !== 'string') {
            errors.push('Search must be a string');
        } else {
            search = search.trim();
            if (search !== '') {
                validatedQuery.search = search;
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
                validatedQuery.status = status;
            }
        }
    } else {
        // default to all
        validatedQuery.status = 'all';
    }

    // Country ID validation
    if (countryId !== undefined) {
        if (typeof countryId !== 'string') {
            errors.push('Country ID must be a string');
        } else {
            countryId = countryId.trim();
            if (countryId !== '') {
                if (!/^[1-9]\d*$/.test(countryId)) {
                    errors.push('Invalid Country ID format');
                } else {
                    validatedQuery.countryId = countryId;
                }
            }
        }
    }

    // Province ID validation
    if (provinceId !== undefined) {
        if (typeof provinceId !== 'string') {
            errors.push('Province ID must be a string');
        } else {
            provinceId = provinceId.trim();
            if (provinceId !== '') {
                if (!/^[1-9]\d*$/.test(provinceId)) {
                    errors.push('Invalid Province ID format');
                } else {
                    validatedQuery.provinceId = provinceId;
                }
            }
        }
    }

    // Division ID validation
    if (divisionId !== undefined) {
        if (typeof divisionId !== 'string') {
            errors.push('Division ID must be a string');
        } else {
            divisionId = divisionId.trim();
            if (divisionId !== '') {
                if (!/^[1-9]\d*$/.test(divisionId)) {
                    errors.push('Invalid Division ID format');
                } else {
                    validatedQuery.divisionId = divisionId;
                }
            }
        }
    }

    // District ID validation
    if (districtId !== undefined) {
        if (typeof districtId !== 'string') {
            errors.push('District ID must be a string');
        } else {
            districtId = districtId.trim();
            if (districtId !== '') {
                if (!/^[1-9]\d*$/.test(districtId)) {
                    errors.push('Invalid District ID format');
                } else {
                    validatedQuery.districtId = districtId;
                }
            }
        }
    }

    // Tehsil ID validation
    if (tehsilId !== undefined) {
        if (typeof tehsilId !== 'string') {
            errors.push('Tehsil ID must be a string');
        } else {
            tehsilId = tehsilId.trim();
            if (tehsilId !== '') {
                if (!/^[1-9]\d*$/.test(tehsilId)) {
                    errors.push('Invalid Tehsil ID format');
                } else {
                    validatedQuery.tehsilId = tehsilId;
                }
            }
        }
    }

    // Page validation
    if (page !== undefined) {
        if (typeof page !== 'string') {
            errors.push('Page must be a string');
        } else {
            page = page.trim();
            if (page !== '') {
                if (!/^[1-9]\d*$/.test(page)) {
                    errors.push('Page must be a positive whole integer');
                } else {
                    validatedQuery.page = Number(page);
                }
            }
        }
    }

    // Limit validation
    if (limit !== undefined) {
        if (typeof limit !== 'string') {
            errors.push('Limit must be a string');
        } else {
            limit = limit.trim();
            if (limit !== '') {
                if (!/^[1-9]\d*$/.test(limit)) {
                    errors.push('Limit must be a positive whole integer');
                } else {
                    validatedQuery.limit = Number(limit);
                }
            }
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        });
    }

    req.validatedQuery = validatedQuery;
    next();
};

const validateCreateCity = (req, res, next) => {
    let { tehsil_id, city_english, city_urdu, city_abb } = req.body;
    const errors = [];
    const validatedBody = {};

    // 1. tehsil_id
    if (tehsil_id === undefined || tehsil_id === null) {
        errors.push('Tehsil ID is required');
    } else if (typeof tehsil_id !== 'string') {
        errors.push('Tehsil ID must be a string');
    } else {
        tehsil_id = tehsil_id.trim();
        if (tehsil_id === '') {
            errors.push('Tehsil ID is required');
        } else if (!/^[1-9]\d*$/.test(tehsil_id)) {
            errors.push('Invalid Tehsil ID format');
        } else {
            validatedBody.tehsil_id = tehsil_id;
        }
    }

    // 2. city_english
    if (city_english === undefined || city_english === null) {
        errors.push('City Name (English) is required');
    } else if (typeof city_english !== 'string') {
        errors.push('City Name (English) must be a string');
    } else {
        city_english = city_english.trim();
        if (city_english === '') {
            errors.push('City Name (English) is required');
        } else if (city_english.length > 100) {
            errors.push('City Name (English) must not exceed 100 characters');
        } else {
            validatedBody.city_english = city_english;
        }
    }

    // 3. city_urdu
    if (city_urdu === undefined || city_urdu === null || city_urdu === '') {
        validatedBody.city_urdu = null;
    } else if (typeof city_urdu !== 'string') {
        errors.push('City Name (Urdu) must be a string');
    } else {
        city_urdu = city_urdu.trim();
        if (city_urdu === '') {
            validatedBody.city_urdu = null;
        } else if (city_urdu.length > 100) {
            errors.push('City Name (Urdu) must not exceed 100 characters');
        } else {
            validatedBody.city_urdu = city_urdu;
        }
    }

    // 4. city_abb
    if (city_abb === undefined || city_abb === null || city_abb === '') {
        validatedBody.city_abb = null;
    } else if (typeof city_abb !== 'string') {
        errors.push('Abbreviation must be a string');
    } else {
        city_abb = city_abb.trim();
        if (city_abb === '') {
            validatedBody.city_abb = null;
        } else if (city_abb.length > 20) {
            errors.push('Abbreviation must not exceed 20 characters');
        } else {
            validatedBody.city_abb = city_abb;
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        });
    }

    req.validatedBody = validatedBody;
    next();
};

const validateCityId = (req, res, next) => {
    let id = req.params.id;
    if (!id || typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid City ID format"
        });
    }
    // keep raw string
    next();
};

const validateUpdateCity = (req, res, next) => {
    let { tehsil_id, city_english, city_urdu, city_abb, is_active } = req.body;
    const errors = [];
    const validatedBody = {};

    // 1. tehsil_id
    if (tehsil_id === undefined || tehsil_id === null) {
        errors.push('Tehsil ID is required');
    } else if (typeof tehsil_id !== 'string') {
        errors.push('Tehsil ID must be a string');
    } else {
        tehsil_id = tehsil_id.trim();
        if (tehsil_id === '') {
            errors.push('Tehsil ID is required');
        } else if (!/^[1-9]\d*$/.test(tehsil_id)) {
            errors.push('Invalid Tehsil ID format');
        } else {
            validatedBody.tehsil_id = tehsil_id;
        }
    }

    // 2. city_english
    if (city_english === undefined || city_english === null) {
        errors.push('City Name (English) is required');
    } else if (typeof city_english !== 'string') {
        errors.push('City Name (English) must be a string');
    } else {
        city_english = city_english.trim();
        if (city_english === '') {
            errors.push('City Name (English) is required');
        } else if (city_english.length > 100) {
            errors.push('City Name (English) must not exceed 100 characters');
        } else {
            validatedBody.city_english = city_english;
        }
    }

    // 3. city_urdu
    if (city_urdu === undefined || city_urdu === null || city_urdu === '') {
        validatedBody.city_urdu = null;
    } else if (typeof city_urdu !== 'string') {
        errors.push('City Name (Urdu) must be a string');
    } else {
        city_urdu = city_urdu.trim();
        if (city_urdu === '') {
            validatedBody.city_urdu = null;
        } else if (city_urdu.length > 100) {
            errors.push('City Name (Urdu) must not exceed 100 characters');
        } else {
            validatedBody.city_urdu = city_urdu;
        }
    }

    // 4. city_abb
    if (city_abb === undefined || city_abb === null || city_abb === '') {
        validatedBody.city_abb = null;
    } else if (typeof city_abb !== 'string') {
        errors.push('Abbreviation must be a string');
    } else {
        city_abb = city_abb.trim();
        if (city_abb === '') {
            validatedBody.city_abb = null;
        } else if (city_abb.length > 20) {
            errors.push('Abbreviation must not exceed 20 characters');
        } else {
            validatedBody.city_abb = city_abb;
        }
    }

    // 5. is_active
    if (is_active === undefined || is_active === null) {
        errors.push('is_active status is required');
    } else if (typeof is_active !== 'boolean') {
        errors.push('is_active must be a boolean');
    } else {
        validatedBody.is_active = is_active;
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        });
    }

    req.validatedBody = validatedBody;
    next();
};

module.exports = {
    validateGetCities,
    validateCreateCity,
    validateCityId,
    validateUpdateCity
};
