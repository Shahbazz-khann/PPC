const validateGetDivisions = (req, res, next) => {
    let { search, status, countryId, provinceId, page, limit } = req.query;

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

    // Province ID validation
    if (provinceId !== undefined) {
        if (typeof provinceId !== 'string') {
            errors.push('Province ID must be a string');
        } else {
            provinceId = provinceId.trim();
            if (provinceId === '') {
                delete req.query.provinceId;
            } else if (!/^[1-9]\d*$/.test(provinceId)) {
                errors.push('Invalid Province ID format');
            } else {
                req.query.provinceId = provinceId;
            }
        }
    }

    // Page validation
    if (page !== undefined) {
        const parsedPage = parseInt(page, 10);
        if (isNaN(parsedPage) || parsedPage < 1) {
            errors.push('Page must be a positive integer');
        } else {
            req.query.page = parsedPage;
        }
    } else {
        req.query.page = 1;
    }

    // Limit validation
    if (limit !== undefined) {
        const parsedLimit = parseInt(limit, 10);
        if (isNaN(parsedLimit) || parsedLimit < 1) {
            errors.push('Limit must be a positive integer');
        } else {
            req.query.limit = parsedLimit;
        }
    } else {
        req.query.limit = 10;
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

const validateCreateDivision = (req, res, next) => {
    // Strict whitelist
    const allowedFields = ['province_id', 'division_english', 'division_urdu', 'division_abb'];
    const bodyKeys = Object.keys(req.body);
    for (const key of bodyKeys) {
        if (!allowedFields.includes(key)) {
            delete req.body[key];
        }
    }

    let { province_id, division_english, division_urdu, division_abb } = req.body;
    const errors = [];

    // Province ID validation
    if (province_id === undefined || province_id === null) {
        errors.push('province_id is required');
    } else if (typeof province_id !== 'string') {
        errors.push('province_id must be a string');
    } else {
        province_id = province_id.trim();
        if (!/^[1-9]\d*$/.test(province_id)) {
            errors.push('province_id must be a valid positive integer string');
        } else {
            req.body.province_id = province_id;
        }
    }

    // English Name validation
    if (division_english === undefined || division_english === null) {
        errors.push('division_english is required');
    } else if (typeof division_english !== 'string') {
        errors.push('division_english must be a string');
    } else {
        division_english = division_english.trim();
        if (division_english === '') {
            errors.push('division_english cannot be blank');
        } else if (division_english.length > 255) {
            errors.push('division_english cannot exceed 255 characters');
        } else {
            req.body.division_english = division_english;
        }
    }

    // Urdu Name validation
    if (division_urdu !== undefined && division_urdu !== null) {
        if (typeof division_urdu !== 'string') {
            errors.push('division_urdu must be a string');
        } else {
            division_urdu = division_urdu.trim();
            if (division_urdu === '') {
                req.body.division_urdu = null;
            } else if (division_urdu.length > 255) {
                errors.push('division_urdu cannot exceed 255 characters');
            } else {
                req.body.division_urdu = division_urdu;
            }
        }
    } else {
        req.body.division_urdu = null;
    }

    // Abbreviation validation
    if (division_abb !== undefined && division_abb !== null) {
        if (typeof division_abb !== 'string') {
            errors.push('division_abb must be a string');
        } else {
            division_abb = division_abb.trim();
            if (division_abb === '') {
                req.body.division_abb = null;
            } else if (division_abb.length > 50) {
                errors.push('division_abb cannot exceed 50 characters');
            } else {
                req.body.division_abb = division_abb;
            }
        }
    } else {
        req.body.division_abb = null;
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

const validateDivisionIdParam = (req, res, next) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || !/^[1-9]\d*$/.test(id.trim())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Division ID format'
        });
    }
    req.params.id = id.trim();
    next();
};

const validateUpdateDivision = (req, res, next) => {
    // Strict whitelist
    const allowedFields = ['province_id', 'division_english', 'division_urdu', 'division_abb', 'is_active'];
    const bodyKeys = Object.keys(req.body);
    for (const key of bodyKeys) {
        if (!allowedFields.includes(key)) {
            delete req.body[key];
        }
    }

    let { province_id, division_english, division_urdu, division_abb, is_active } = req.body;
    const errors = [];

    // Province ID validation
    if (province_id === undefined || province_id === null) {
        errors.push('province_id is required');
    } else if (typeof province_id !== 'string') {
        errors.push('province_id must be a string');
    } else {
        province_id = province_id.trim();
        if (!/^[1-9]\d*$/.test(province_id)) {
            errors.push('province_id must be a valid positive integer string');
        } else {
            req.body.province_id = province_id;
        }
    }

    // English Name validation
    if (division_english === undefined || division_english === null) {
        errors.push('division_english is required');
    } else if (typeof division_english !== 'string') {
        errors.push('division_english must be a string');
    } else {
        division_english = division_english.trim();
        if (division_english === '') {
            errors.push('division_english cannot be blank');
        } else if (division_english.length > 255) {
            errors.push('division_english cannot exceed 255 characters');
        } else {
            req.body.division_english = division_english;
        }
    }

    // Urdu Name validation
    if (division_urdu !== undefined && division_urdu !== null) {
        if (typeof division_urdu !== 'string') {
            errors.push('division_urdu must be a string');
        } else {
            division_urdu = division_urdu.trim();
            if (division_urdu === '') {
                req.body.division_urdu = null;
            } else if (division_urdu.length > 255) {
                errors.push('division_urdu cannot exceed 255 characters');
            } else {
                req.body.division_urdu = division_urdu;
            }
        }
    } else {
        req.body.division_urdu = null;
    }

    // Abbreviation validation
    if (division_abb !== undefined && division_abb !== null) {
        if (typeof division_abb !== 'string') {
            errors.push('division_abb must be a string');
        } else {
            division_abb = division_abb.trim();
            if (division_abb === '') {
                req.body.division_abb = null;
            } else if (division_abb.length > 50) {
                errors.push('division_abb cannot exceed 50 characters');
            } else {
                req.body.division_abb = division_abb;
            }
        }
    } else {
        req.body.division_abb = null;
    }

    // Status validation
    if (is_active === undefined || is_active === null) {
        errors.push('is_active is required');
    } else if (typeof is_active !== 'boolean') {
        errors.push('is_active must be a boolean');
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

module.exports = {
    validateGetDivisions,
    validateCreateDivision,
    validateDivisionIdParam,
    validateUpdateDivision
};
