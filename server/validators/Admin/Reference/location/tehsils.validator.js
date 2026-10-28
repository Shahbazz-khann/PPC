const validateGetTehsils = (req, res, next) => {
    let { search, status, countryId, provinceId, divisionId, districtId, page, limit } = req.query;

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

    // Page validation
    if (page !== undefined) {
        if (!/^[1-9]\d*$/.test(page)) {
            errors.push('Page must be a positive integer');
        } else {
            validatedQuery.page = parseInt(page, 10);
        }
    } else {
        validatedQuery.page = 1;
    }

    // Limit validation
    if (limit !== undefined) {
        if (!/^[1-9]\d*$/.test(limit)) {
            errors.push('Limit must be a positive integer');
        } else {
            validatedQuery.limit = parseInt(limit, 10);
        }
    } else {
        validatedQuery.limit = 10;
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    req.validatedQuery = validatedQuery;
    next();
};

const validateCreateTehsil = (req, res, next) => {
    let { district_id, tehsil_english, tehsil_urdu, tehsil_abb } = req.body;
    const errors = [];
    const validatedBody = {};

    // district_id validation
    if (district_id === undefined || district_id === null) {
        errors.push('District ID is required');
    } else if (typeof district_id !== 'string') {
        errors.push('District ID must be a string');
    } else {
        district_id = district_id.trim();
        if (district_id === '') {
            errors.push('District ID is required');
        } else if (!/^[1-9]\d*$/.test(district_id)) {
            errors.push('Invalid District ID format');
        } else {
            validatedBody.district_id = district_id;
        }
    }

    // tehsil_english validation
    if (tehsil_english === undefined || tehsil_english === null) {
        errors.push('English name is required');
    } else if (typeof tehsil_english !== 'string') {
        errors.push('English name must be a string');
    } else {
        tehsil_english = tehsil_english.trim();
        if (tehsil_english === '') {
            errors.push('English name is required');
        } else if (tehsil_english.length > 100) {
            errors.push('English name must not exceed 100 characters');
        } else {
            validatedBody.tehsil_english = tehsil_english;
        }
    }

    // tehsil_urdu normalization & validation
    if (tehsil_urdu === undefined || tehsil_urdu === null) {
        validatedBody.tehsil_urdu = null;
    } else if (typeof tehsil_urdu !== 'string') {
        errors.push('Urdu name must be a string');
    } else {
        tehsil_urdu = tehsil_urdu.trim();
        if (tehsil_urdu === '') {
            validatedBody.tehsil_urdu = null;
        } else if (tehsil_urdu.length > 100) {
            errors.push('Urdu name must not exceed 100 characters');
        } else {
            validatedBody.tehsil_urdu = tehsil_urdu;
        }
    }

    // tehsil_abb normalization & validation
    if (tehsil_abb === undefined || tehsil_abb === null) {
        validatedBody.tehsil_abb = null;
    } else if (typeof tehsil_abb !== 'string') {
        errors.push('Abbreviation must be a string');
    } else {
        tehsil_abb = tehsil_abb.trim();
        if (tehsil_abb === '') {
            validatedBody.tehsil_abb = null;
        } else if (tehsil_abb.length > 20) {
            errors.push('Abbreviation must not exceed 20 characters');
        } else {
            validatedBody.tehsil_abb = tehsil_abb;
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

const validateTehsilId = (req, res, next) => {
    const { id } = req.params;
    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Tehsil ID format'
        });
    }
    next();
};

const validateUpdateTehsil = (req, res, next) => {
    let { district_id, tehsil_english, tehsil_urdu, tehsil_abb, is_active } = req.body;
    const errors = [];
    const validatedBody = {};

    // district_id validation
    if (district_id === undefined || district_id === null) {
        errors.push('District ID is required');
    } else if (typeof district_id !== 'string') {
        errors.push('District ID must be a string');
    } else {
        district_id = district_id.trim();
        if (district_id === '') {
            errors.push('District ID is required');
        } else if (!/^[1-9]\d*$/.test(district_id)) {
            errors.push('Invalid District ID format');
        } else {
            validatedBody.district_id = district_id;
        }
    }

    // tehsil_english validation
    if (tehsil_english === undefined || tehsil_english === null) {
        errors.push('English name is required');
    } else if (typeof tehsil_english !== 'string') {
        errors.push('English name must be a string');
    } else {
        tehsil_english = tehsil_english.trim();
        if (tehsil_english === '') {
            errors.push('English name is required');
        } else if (tehsil_english.length > 100) {
            errors.push('English name must not exceed 100 characters');
        } else {
            validatedBody.tehsil_english = tehsil_english;
        }
    }

    // tehsil_urdu validation
    if (tehsil_urdu === undefined || tehsil_urdu === null) {
        validatedBody.tehsil_urdu = null;
    } else if (typeof tehsil_urdu !== 'string') {
        errors.push('Urdu name must be a string');
    } else {
        tehsil_urdu = tehsil_urdu.trim();
        if (tehsil_urdu === '') {
            validatedBody.tehsil_urdu = null;
        } else if (tehsil_urdu.length > 100) {
            errors.push('Urdu name must not exceed 100 characters');
        } else {
            validatedBody.tehsil_urdu = tehsil_urdu;
        }
    }

    // tehsil_abb validation
    if (tehsil_abb === undefined || tehsil_abb === null) {
        validatedBody.tehsil_abb = null;
    } else if (typeof tehsil_abb !== 'string') {
        errors.push('Abbreviation must be a string');
    } else {
        tehsil_abb = tehsil_abb.trim();
        if (tehsil_abb === '') {
            validatedBody.tehsil_abb = null;
        } else if (tehsil_abb.length > 20) {
            errors.push('Abbreviation must not exceed 20 characters');
        } else {
            validatedBody.tehsil_abb = tehsil_abb;
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
    validateGetTehsils,
    validateCreateTehsil,
    validateTehsilId,
    validateUpdateTehsil
};
