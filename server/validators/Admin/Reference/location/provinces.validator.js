const validateGetProvinces = (req, res, next) => {
    let { search, status, countryId } = req.query;

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
        // default to all
        req.query.status = 'all';
    }

    // Country ID validation
    if (countryId !== undefined) {
        if (typeof countryId !== 'string') {
            errors.push('Country ID must be a string');
        } else {
            countryId = countryId.trim();
            if (countryId === '') {
                delete req.query.countryId;
            } else if (!/^[1-9]\d*$/.test(countryId)) {
                errors.push('Invalid Country ID format');
            } else {
                req.query.countryId = countryId;
            }
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

const validateCreateProvince = (req, res, next) => {
    let { country_id, province_english, province_urdu, province_abb } = req.body;
    const errors = [];

    // country_id validation
    if (country_id === undefined || country_id === null) {
        errors.push('Country ID is required');
    } else {
        if (typeof country_id === 'number') {
            country_id = country_id.toString();
        }
        if (typeof country_id !== 'string') {
            errors.push('Country ID must be a string');
        } else {
            country_id = country_id.trim();
            if (country_id === '') {
                errors.push('Country ID cannot be blank');
            } else if (!/^[1-9]\d*$/.test(country_id)) {
                errors.push('Invalid Country ID format');
            } else {
                req.body.country_id = country_id;
            }
        }
    }

    // province_english validation
    if (province_english === undefined || province_english === null) {
        errors.push('Province English name is required');
    } else if (typeof province_english !== 'string') {
        errors.push('Province English name must be a string');
    } else {
        province_english = province_english.trim();
        if (province_english === '') {
            errors.push('Province English name cannot be blank');
        } else if (province_english.length > 100) {
            errors.push('Province English name cannot exceed 100 characters');
        } else {
            req.body.province_english = province_english;
        }
    }

    // province_urdu validation
    if (province_urdu === undefined || province_urdu === null) {
        req.body.province_urdu = null;
    } else if (typeof province_urdu !== 'string') {
        errors.push('Province Urdu name must be a string');
    } else {
        province_urdu = province_urdu.trim();
        if (province_urdu === '') {
            req.body.province_urdu = null;
        } else if (province_urdu.length > 100) {
            errors.push('Province Urdu name cannot exceed 100 characters');
        } else {
            req.body.province_urdu = province_urdu;
        }
    }

    // province_abb validation
    if (province_abb === undefined || province_abb === null) {
        req.body.province_abb = null;
    } else if (typeof province_abb !== 'string') {
        errors.push('Province abbreviation must be a string');
    } else {
        province_abb = province_abb.trim();
        if (province_abb === '') {
            req.body.province_abb = null;
        } else if (province_abb.length > 20) {
            errors.push('Province abbreviation cannot exceed 20 characters');
        } else {
            req.body.province_abb = province_abb;
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Strip unwanted fields
    const allowedKeys = ['country_id', 'province_english', 'province_urdu', 'province_abb'];
    for (const key in req.body) {
        if (!allowedKeys.includes(key)) {
            delete req.body[key];
        }
    }

    next();
};

const validateProvinceId = (req, res, next) => {
    let { id } = req.params;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid Province ID format' });
    }
    id = id.trim();
    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({ success: false, message: 'Invalid Province ID format' });
    }
    req.params.id = id;
    next();
};

const validateUpdateProvince = (req, res, next) => {
    let { country_id, province_english, province_urdu, province_abb, is_active } = req.body;
    const errors = [];

    // country_id validation
    if (country_id === undefined || country_id === null) {
        errors.push('Country ID is required');
    } else {
        if (typeof country_id === 'number') {
            country_id = country_id.toString();
        }
        if (typeof country_id !== 'string') {
            errors.push('Country ID must be a string');
        } else {
            country_id = country_id.trim();
            if (country_id === '') {
                errors.push('Country ID cannot be blank');
            } else if (!/^[1-9]\d*$/.test(country_id)) {
                errors.push('Invalid Country ID format');
            } else {
                req.body.country_id = country_id;
            }
        }
    }

    // province_english validation
    if (province_english === undefined || province_english === null) {
        errors.push('Province English name is required');
    } else if (typeof province_english !== 'string') {
        errors.push('Province English name must be a string');
    } else {
        province_english = province_english.trim();
        if (province_english === '') {
            errors.push('Province English name cannot be blank');
        } else if (province_english.length > 100) {
            errors.push('Province English name cannot exceed 100 characters');
        } else {
            req.body.province_english = province_english;
        }
    }

    // province_urdu validation
    if (province_urdu === undefined || province_urdu === null) {
        req.body.province_urdu = null;
    } else if (typeof province_urdu !== 'string') {
        errors.push('Province Urdu name must be a string');
    } else {
        province_urdu = province_urdu.trim();
        if (province_urdu === '') {
            req.body.province_urdu = null;
        } else if (province_urdu.length > 100) {
            errors.push('Province Urdu name cannot exceed 100 characters');
        } else {
            req.body.province_urdu = province_urdu;
        }
    }

    // province_abb validation
    if (province_abb === undefined || province_abb === null) {
        req.body.province_abb = null;
    } else if (typeof province_abb !== 'string') {
        errors.push('Province abbreviation must be a string');
    } else {
        province_abb = province_abb.trim();
        if (province_abb === '') {
            req.body.province_abb = null;
        } else if (province_abb.length > 20) {
            errors.push('Province abbreviation cannot exceed 20 characters');
        } else {
            req.body.province_abb = province_abb;
        }
    }

    // is_active validation
    if (is_active === undefined || is_active === null) {
        errors.push('Status (is_active) is required');
    } else if (typeof is_active !== 'boolean') {
        errors.push('Status (is_active) must be a boolean');
    } else {
        req.body.is_active = is_active;
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Strip unwanted fields
    const allowedKeys = ['country_id', 'province_english', 'province_urdu', 'province_abb', 'is_active'];
    for (const key in req.body) {
        if (!allowedKeys.includes(key)) {
            delete req.body[key];
        }
    }

    next();
};

module.exports = {
    validateGetProvinces,
    validateCreateProvince,
    validateProvinceId,
    validateUpdateProvince
};
