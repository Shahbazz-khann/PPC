const validateGetDistricts = (req, res, next) => {
    let { search, status, countryId, provinceId, divisionId, page, limit } = req.query;

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

    // Division ID validation
    if (divisionId !== undefined) {
        if (typeof divisionId !== 'string') {
            errors.push('Division ID must be a string');
        } else {
            divisionId = divisionId.trim();
            if (divisionId === '') {
                delete req.query.divisionId;
            } else if (!/^[1-9]\d*$/.test(divisionId)) {
                errors.push('Invalid Division ID format');
            } else {
                req.query.divisionId = divisionId;
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

const validateCreateDistrict = (req, res, next) => {
    // Strict whitelist
    const allowedFields = ['division_id', 'district_english', 'district_urdu', 'district_abb'];
    const bodyKeys = Object.keys(req.body);
    for (const key of bodyKeys) {
        if (!allowedFields.includes(key)) {
            delete req.body[key];
        }
    }

    let { division_id, district_english, district_urdu, district_abb } = req.body;
    const errors = [];

    // Division ID validation
    if (division_id === undefined || division_id === null) {
        errors.push('division_id is required');
    } else if (typeof division_id !== 'string') {
        errors.push('division_id must be a string');
    } else {
        division_id = division_id.trim();
        if (!/^[1-9]\d*$/.test(division_id)) {
            errors.push('division_id must be a valid positive integer string');
        } else {
            req.body.division_id = division_id;
        }
    }

    // English Name validation
    if (district_english === undefined || district_english === null) {
        errors.push('district_english is required');
    } else if (typeof district_english !== 'string') {
        errors.push('district_english must be a string');
    } else {
        district_english = district_english.trim();
        if (district_english === '') {
            errors.push('district_english cannot be blank');
        } else if (district_english.length > 100) {
            errors.push('district_english cannot exceed 100 characters');
        } else {
            req.body.district_english = district_english;
        }
    }

    // Urdu Name validation
    if (district_urdu !== undefined && district_urdu !== null) {
        if (typeof district_urdu !== 'string') {
            errors.push('district_urdu must be a string');
        } else {
            district_urdu = district_urdu.trim();
            if (district_urdu === '') {
                req.body.district_urdu = null;
            } else if (district_urdu.length > 100) {
                errors.push('district_urdu cannot exceed 100 characters');
            } else {
                req.body.district_urdu = district_urdu;
            }
        }
    } else {
        req.body.district_urdu = null;
    }

    // Abbreviation validation
    if (district_abb !== undefined && district_abb !== null) {
        if (typeof district_abb !== 'string') {
            errors.push('district_abb must be a string');
        } else {
            district_abb = district_abb.trim();
            if (district_abb === '') {
                req.body.district_abb = null;
            } else if (district_abb.length > 20) {
                errors.push('district_abb cannot exceed 20 characters');
            } else {
                req.body.district_abb = district_abb;
            }
        }
    } else {
        req.body.district_abb = null;
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

const validateDistrictId = (req, res, next) => {
    const id = req.params.id;
    if (!id || !/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid district ID format'
        });
    }
    next();
};

const validateUpdateDistrict = (req, res, next) => {
    const allowedFields = ['division_id', 'district_english', 'district_urdu', 'district_abb', 'is_active'];
    const bodyKeys = Object.keys(req.body);
    for (const key of bodyKeys) {
        if (!allowedFields.includes(key)) {
            delete req.body[key];
        }
    }

    let { division_id, district_english, district_urdu, district_abb, is_active } = req.body;
    const errors = [];

    // Division ID validation
    if (division_id === undefined || division_id === null) {
        errors.push('division_id is required');
    } else if (typeof division_id !== 'string') {
        errors.push('division_id must be a string');
    } else {
        division_id = division_id.trim();
        if (!/^[1-9]\d*$/.test(division_id)) {
            errors.push('division_id must be a valid positive integer string');
        } else {
            req.body.division_id = division_id;
        }
    }

    // English Name validation
    if (district_english === undefined || district_english === null) {
        errors.push('district_english is required');
    } else if (typeof district_english !== 'string') {
        errors.push('district_english must be a string');
    } else {
        district_english = district_english.trim();
        if (district_english === '') {
            errors.push('district_english cannot be blank');
        } else if (district_english.length > 100) {
            errors.push('district_english cannot exceed 100 characters');
        } else {
            req.body.district_english = district_english;
        }
    }

    // Urdu Name validation
    if (district_urdu !== undefined && district_urdu !== null) {
        if (typeof district_urdu !== 'string') {
            errors.push('district_urdu must be a string');
        } else {
            district_urdu = district_urdu.trim();
            if (district_urdu === '') {
                req.body.district_urdu = null;
            } else if (district_urdu.length > 100) {
                errors.push('district_urdu cannot exceed 100 characters');
            } else {
                req.body.district_urdu = district_urdu;
            }
        }
    } else {
        req.body.district_urdu = null;
    }

    // Abbreviation validation
    if (district_abb !== undefined && district_abb !== null) {
        if (typeof district_abb !== 'string') {
            errors.push('district_abb must be a string');
        } else {
            district_abb = district_abb.trim();
            if (district_abb === '') {
                req.body.district_abb = null;
            } else if (district_abb.length > 20) {
                errors.push('district_abb cannot exceed 20 characters');
            } else {
                req.body.district_abb = district_abb;
            }
        }
    } else {
        req.body.district_abb = null;
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
    validateGetDistricts,
    validateCreateDistrict,
    validateDistrictId,
    validateUpdateDistrict
};
