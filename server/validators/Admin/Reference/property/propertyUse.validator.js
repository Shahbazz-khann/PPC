const validateGetPropertyUses = (req, res, next) => {
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

const validateCreatePropertyUse = (req, res, next) => {
    const { property_use_description, property_use_urdu, property_use_abb } = req.body;
    const errors = [];
    const validatedBody = {};

    // 1. property_use_description
    if (property_use_description === undefined || property_use_description === null) {
        errors.push('property_use_description is required');
    } else if (typeof property_use_description !== 'string') {
        errors.push('property_use_description must be a string');
    } else {
        const trimmedDesc = property_use_description.trim();
        if (trimmedDesc === '') {
            errors.push('property_use_description cannot be empty');
        } else if (trimmedDesc.length > 150) {
            errors.push('property_use_description cannot exceed 150 characters');
        } else {
            validatedBody.property_use_description = trimmedDesc;
        }
    }

    // 2. property_use_urdu
    if (property_use_urdu === undefined || property_use_urdu === null) {
        validatedBody.property_use_urdu = null;
    } else if (typeof property_use_urdu !== 'string') {
        errors.push('property_use_urdu must be a string if provided');
    } else {
        const trimmedUrdu = property_use_urdu.trim();
        if (trimmedUrdu === '') {
            validatedBody.property_use_urdu = null;
        } else if (trimmedUrdu.length > 150) {
            errors.push('property_use_urdu cannot exceed 150 characters');
        } else {
            validatedBody.property_use_urdu = trimmedUrdu;
        }
    }

    // 3. property_use_abb
    if (property_use_abb === undefined || property_use_abb === null) {
        validatedBody.property_use_abb = null;
    } else if (typeof property_use_abb !== 'string') {
        errors.push('property_use_abb must be a string if provided');
    } else {
        const trimmedAbb = property_use_abb.trim();
        if (trimmedAbb === '') {
            validatedBody.property_use_abb = null;
        } else if (trimmedAbb.length > 30) {
            errors.push('property_use_abb cannot exceed 30 characters');
        } else {
            validatedBody.property_use_abb = trimmedAbb;
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Pass strictly whitelisted fields
    req.validatedBody = validatedBody;
    next();
};

const validatePropertyUseId = (req, res, next) => {
    const { id } = req.params;
    if (!id || !/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Property Use ID'
        });
    }
    next();
};

const validateUpdatePropertyUse = (req, res, next) => {
    const { property_use_description, property_use_urdu, property_use_abb, is_active } = req.body;
    const errors = [];
    const validatedBody = {};

    // 1. property_use_description
    if (property_use_description === undefined || property_use_description === null) {
        errors.push('property_use_description is required');
    } else if (typeof property_use_description !== 'string') {
        errors.push('property_use_description must be a string');
    } else {
        const trimmedDesc = property_use_description.trim();
        if (trimmedDesc === '') {
            errors.push('property_use_description cannot be empty');
        } else if (trimmedDesc.length > 150) {
            errors.push('property_use_description cannot exceed 150 characters');
        } else {
            validatedBody.property_use_description = trimmedDesc;
        }
    }

    // 2. property_use_urdu
    if (property_use_urdu === undefined || property_use_urdu === null) {
        validatedBody.property_use_urdu = null;
    } else if (typeof property_use_urdu !== 'string') {
        errors.push('property_use_urdu must be a string if provided');
    } else {
        const trimmedUrdu = property_use_urdu.trim();
        if (trimmedUrdu === '') {
            validatedBody.property_use_urdu = null;
        } else if (trimmedUrdu.length > 150) {
            errors.push('property_use_urdu cannot exceed 150 characters');
        } else {
            validatedBody.property_use_urdu = trimmedUrdu;
        }
    }

    // 3. property_use_abb
    if (property_use_abb === undefined || property_use_abb === null) {
        validatedBody.property_use_abb = null;
    } else if (typeof property_use_abb !== 'string') {
        errors.push('property_use_abb must be a string if provided');
    } else {
        const trimmedAbb = property_use_abb.trim();
        if (trimmedAbb === '') {
            validatedBody.property_use_abb = null;
        } else if (trimmedAbb.length > 30) {
            errors.push('property_use_abb cannot exceed 30 characters');
        } else {
            validatedBody.property_use_abb = trimmedAbb;
        }
    }

    // 4. is_active
    if (is_active === undefined || is_active === null) {
        errors.push('is_active is required');
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
    validateGetPropertyUses,
    validateCreatePropertyUse,
    validatePropertyUseId,
    validateUpdatePropertyUse
};
