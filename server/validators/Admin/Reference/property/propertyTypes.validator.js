const validateGetPropertyTypes = (req, res, next) => {
    let { search, status, page, limit } = req.query;

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

const validateCreatePropertyType = (req, res, next) => {
    // STRICT CREATE BODY WHITELIST
    const {
        property_type_description,
        property_type_urdu,
        property_type_abb
    } = req.body;

    const errors = [];
    const validatedBody = {};

    // ENGLISH DESCRIPTION VALIDATION
    if (property_type_description === undefined || property_type_description === null) {
        errors.push('Property type description is required');
    } else if (typeof property_type_description !== 'string') {
        errors.push('Property type description must be a string');
    } else {
        const trimmedDescription = property_type_description.trim();
        if (trimmedDescription === '') {
            errors.push('Property type description cannot be empty');
        } else if (trimmedDescription.length > 150) {
            errors.push('Property type description cannot exceed 150 characters');
        } else {
            validatedBody.property_type_description = trimmedDescription;
        }
    }

    // URDU VALIDATION
    if (property_type_urdu === undefined || property_type_urdu === null || (typeof property_type_urdu === 'string' && property_type_urdu.trim() === '')) {
        validatedBody.property_type_urdu = null;
    } else if (typeof property_type_urdu !== 'string') {
        errors.push('Property type Urdu must be a string');
    } else {
        const trimmedUrdu = property_type_urdu.trim();
        if (trimmedUrdu.length > 150) {
            errors.push('Property type Urdu cannot exceed 150 characters');
        } else {
            validatedBody.property_type_urdu = trimmedUrdu;
        }
    }

    // ABBREVIATION VALIDATION
    if (property_type_abb === undefined || property_type_abb === null || (typeof property_type_abb === 'string' && property_type_abb.trim() === '')) {
        validatedBody.property_type_abb = null;
    } else if (typeof property_type_abb !== 'string') {
        errors.push('Property type abbreviation must be a string');
    } else {
        const trimmedAbb = property_type_abb.trim();
        if (trimmedAbb.length > 30) {
            errors.push('Property type abbreviation cannot exceed 30 characters');
        } else {
            validatedBody.property_type_abb = trimmedAbb;
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

const validatePropertyTypeId = (req, res, next) => {
    const { id } = req.params;

    if (!id || !/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid property type ID format'
        });
    }
    
    // We pass it as string, no parseInt, due to bigint rules
    req.validatedId = id;
    next();
};

const validateUpdatePropertyType = (req, res, next) => {
    // STRICT UPDATE BODY WHITELIST
    const {
        property_type_description,
        property_type_urdu,
        property_type_abb,
        is_active
    } = req.body;

    const errors = [];
    const validatedBody = {};

    // ENGLISH DESCRIPTION VALIDATION
    if (property_type_description === undefined || property_type_description === null) {
        errors.push('Property type description is required');
    } else if (typeof property_type_description !== 'string') {
        errors.push('Property type description must be a string');
    } else {
        const trimmedDescription = property_type_description.trim();
        if (trimmedDescription === '') {
            errors.push('Property type description cannot be empty');
        } else if (trimmedDescription.length > 150) {
            errors.push('Property type description cannot exceed 150 characters');
        } else {
            validatedBody.property_type_description = trimmedDescription;
        }
    }

    // URDU VALIDATION
    if (property_type_urdu === undefined || property_type_urdu === null || (typeof property_type_urdu === 'string' && property_type_urdu.trim() === '')) {
        validatedBody.property_type_urdu = null;
    } else if (typeof property_type_urdu !== 'string') {
        errors.push('Property type Urdu must be a string');
    } else {
        const trimmedUrdu = property_type_urdu.trim();
        if (trimmedUrdu.length > 150) {
            errors.push('Property type Urdu cannot exceed 150 characters');
        } else {
            validatedBody.property_type_urdu = trimmedUrdu;
        }
    }

    // ABBREVIATION VALIDATION
    if (property_type_abb === undefined || property_type_abb === null || (typeof property_type_abb === 'string' && property_type_abb.trim() === '')) {
        validatedBody.property_type_abb = null;
    } else if (typeof property_type_abb !== 'string') {
        errors.push('Property type abbreviation must be a string');
    } else {
        const trimmedAbb = property_type_abb.trim();
        if (trimmedAbb.length > 30) {
            errors.push('Property type abbreviation cannot exceed 30 characters');
        } else {
            validatedBody.property_type_abb = trimmedAbb;
        }
    }

    // STATUS VALIDATION
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
            message: 'Validation failed',
            errors
        });
    }

    req.validatedBody = validatedBody;
    next();
};

module.exports = {
    validateGetPropertyTypes,
    validateCreatePropertyType,
    validatePropertyTypeId,
    validateUpdatePropertyType
};
