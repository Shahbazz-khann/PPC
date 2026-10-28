/**
 * PPC Service Types Request Validators
 */

const validateGetPpcServiceTypes = (req, res, next) => {
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

const validatePpcServiceTypeId = (req, res, next) => {
    const { id } = req.params;

    if (!id || !/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid service type ID. Must be a positive integer.'
        });
    }

    req.params.id = id;
    next();
};

const validateCreatePpcServiceType = (req, res, next) => {
    const { service_type_english, service_type_urdu, service_type_abb } = req.body;
    const errors = [];
    const validatedBody = {};

    // service_type_english (Required)
    if (!service_type_english || typeof service_type_english !== 'string' || service_type_english.trim() === '') {
        errors.push('Service type name in English is required');
    } else {
        const trimmed = service_type_english.trim();
        if (trimmed.length < 2 || trimmed.length > 100) {
            errors.push('Service type English name must be between 2 and 100 characters');
        } else {
            validatedBody.service_type_english = trimmed;
        }
    }

    // service_type_urdu (Optional)
    if (service_type_urdu !== undefined && service_type_urdu !== null) {
        if (typeof service_type_urdu !== 'string') {
            errors.push('Service type Urdu name must be a string');
        } else {
            const trimmedUrdu = service_type_urdu.trim();
            if (trimmedUrdu.length > 100) {
                errors.push('Service type Urdu name cannot exceed 100 characters');
            } else {
                validatedBody.service_type_urdu = trimmedUrdu || null;
            }
        }
    } else {
        validatedBody.service_type_urdu = null;
    }

    // service_type_abb (Optional)
    if (service_type_abb !== undefined && service_type_abb !== null) {
        if (typeof service_type_abb !== 'string') {
            errors.push('Abbreviation must be a string');
        } else {
            const trimmedAbb = service_type_abb.trim();
            if (trimmedAbb.length > 10) {
                errors.push('Abbreviation cannot exceed 10 characters');
            } else {
                validatedBody.service_type_abb = trimmedAbb ? trimmedAbb.toUpperCase() : null;
            }
        }
    } else {
        validatedBody.service_type_abb = null;
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

const validateUpdatePpcServiceType = (req, res, next) => {
    const { service_type_english, service_type_urdu, service_type_abb, is_active } = req.body;
    const errors = [];
    const validatedBody = {};

    // service_type_english (Required)
    if (!service_type_english || typeof service_type_english !== 'string' || service_type_english.trim() === '') {
        errors.push('Service type name in English is required');
    } else {
        const trimmed = service_type_english.trim();
        if (trimmed.length < 2 || trimmed.length > 100) {
            errors.push('Service type English name must be between 2 and 100 characters');
        } else {
            validatedBody.service_type_english = trimmed;
        }
    }

    // service_type_urdu (Optional)
    if (service_type_urdu !== undefined && service_type_urdu !== null) {
        if (typeof service_type_urdu !== 'string') {
            errors.push('Service type Urdu name must be a string');
        } else {
            const trimmedUrdu = service_type_urdu.trim();
            if (trimmedUrdu.length > 100) {
                errors.push('Service type Urdu name cannot exceed 100 characters');
            } else {
                validatedBody.service_type_urdu = trimmedUrdu || null;
            }
        }
    } else {
        validatedBody.service_type_urdu = null;
    }

    // service_type_abb (Optional)
    if (service_type_abb !== undefined && service_type_abb !== null) {
        if (typeof service_type_abb !== 'string') {
            errors.push('Abbreviation must be a string');
        } else {
            const trimmedAbb = service_type_abb.trim();
            if (trimmedAbb.length > 10) {
                errors.push('Abbreviation cannot exceed 10 characters');
            } else {
                validatedBody.service_type_abb = trimmedAbb ? trimmedAbb.toUpperCase() : null;
            }
        }
    } else {
        validatedBody.service_type_abb = null;
    }

    // is_active (Optional boolean, defaults to true)
    if (is_active !== undefined && is_active !== null) {
        if (typeof is_active !== 'boolean') {
            errors.push('is_active must be a boolean');
        } else {
            validatedBody.is_active = is_active;
        }
    } else {
        validatedBody.is_active = true;
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
    validateGetPpcServiceTypes,
    validatePpcServiceTypeId,
    validateCreatePpcServiceType,
    validateUpdatePpcServiceType
};
