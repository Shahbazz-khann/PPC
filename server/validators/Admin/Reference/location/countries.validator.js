const validateGetCountries = (req, res, next) => {
    let { search, status } = req.query;

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

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

const validateCreateCountry = (req, res, next) => {
    let { country_english, country_urdu, country_abb } = req.body;
    const errors = [];

    // country_english validation
    if (country_english === undefined || country_english === null) {
        errors.push('Country English name is required');
    } else if (typeof country_english !== 'string') {
        errors.push('Country English name must be a string');
    } else {
        country_english = country_english.trim();
        if (country_english === '') {
            errors.push('Country English name cannot be blank');
        } else if (country_english.length > 100) {
            errors.push('Country English name cannot exceed 100 characters');
        } else {
            req.body.country_english = country_english;
        }
    }

    // country_urdu validation
    if (country_urdu === undefined || country_urdu === null) {
        req.body.country_urdu = null;
    } else if (typeof country_urdu !== 'string') {
        errors.push('Country Urdu name must be a string');
    } else {
        country_urdu = country_urdu.trim();
        if (country_urdu === '') {
            req.body.country_urdu = null;
        } else if (country_urdu.length > 100) {
            errors.push('Country Urdu name cannot exceed 100 characters');
        } else {
            req.body.country_urdu = country_urdu;
        }
    }

    // country_abb validation
    if (country_abb === undefined || country_abb === null) {
        req.body.country_abb = null;
    } else if (typeof country_abb !== 'string') {
        errors.push('Country abbreviation must be a string');
    } else {
        country_abb = country_abb.trim();
        if (country_abb === '') {
            req.body.country_abb = null;
        } else if (country_abb.length > 20) {
            errors.push('Country abbreviation cannot exceed 20 characters');
        } else {
            req.body.country_abb = country_abb;
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Strip unwated fields
    const allowedKeys = ['country_english', 'country_urdu', 'country_abb'];
    for (const key in req.body) {
        if (!allowedKeys.includes(key)) {
            delete req.body[key];
        }
    }

    next();
};

const validateCountryId = (req, res, next) => {
    const { id } = req.params;
    
    // Accept only positive integer strings greater than 0, though "0" technically isn't standard we'll just check digits.
    // PostgreSQL BigInt maxes out at 9223372036854775807, a string of digits is sufficient.
    if (!id || !/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Country ID format'
        });
    }

    next();
};

const validateUpdateCountry = (req, res, next) => {
    let { country_english, country_urdu, country_abb, is_active } = req.body;
    const errors = [];

    // country_english validation
    if (country_english === undefined || country_english === null) {
        errors.push('Country English name is required');
    } else if (typeof country_english !== 'string') {
        errors.push('Country English name must be a string');
    } else {
        country_english = country_english.trim();
        if (country_english === '') {
            errors.push('Country English name cannot be blank');
        } else if (country_english.length > 100) {
            errors.push('Country English name cannot exceed 100 characters');
        } else {
            req.body.country_english = country_english;
        }
    }

    // country_urdu validation
    if (country_urdu === undefined || country_urdu === null) {
        req.body.country_urdu = null;
    } else if (typeof country_urdu !== 'string') {
        errors.push('Country Urdu name must be a string');
    } else {
        country_urdu = country_urdu.trim();
        if (country_urdu === '') {
            req.body.country_urdu = null;
        } else if (country_urdu.length > 100) {
            errors.push('Country Urdu name cannot exceed 100 characters');
        } else {
            req.body.country_urdu = country_urdu;
        }
    }

    // country_abb validation
    if (country_abb === undefined || country_abb === null) {
        req.body.country_abb = null;
    } else if (typeof country_abb !== 'string') {
        errors.push('Country abbreviation must be a string');
    } else {
        country_abb = country_abb.trim();
        if (country_abb === '') {
            req.body.country_abb = null;
        } else if (country_abb.length > 20) {
            errors.push('Country abbreviation cannot exceed 20 characters');
        } else {
            req.body.country_abb = country_abb;
        }
    }

    // is_active validation
    if (is_active === undefined || is_active === null) {
        errors.push('is_active is required');
    } else if (typeof is_active !== 'boolean') {
        errors.push('is_active must be a boolean (true/false)');
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

    // Strip unwated fields
    const allowedKeys = ['country_english', 'country_urdu', 'country_abb', 'is_active'];
    for (const key in req.body) {
        if (!allowedKeys.includes(key)) {
            delete req.body[key];
        }
    }

    next();
};

module.exports = {
    validateGetCountries,
    validateCreateCountry,
    validateCountryId,
    validateUpdateCountry
};
