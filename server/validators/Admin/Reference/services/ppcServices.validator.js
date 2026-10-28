/**
 * PPC Services Request Validators
 */

const validateGetPpcServices = (req, res, next) => {
    let { search, status, service_type_id, page, limit } = req.query;

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

    // Service Type ID validation
    if (service_type_id !== undefined && service_type_id !== '' && service_type_id !== 'all') {
        if (!/^[1-9]\d*$/.test(String(service_type_id).trim())) {
            errors.push('Service Type ID must be a positive integer');
        } else {
            validatedQuery.service_type_id = parseInt(String(service_type_id).trim(), 10);
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

const validatePpcServiceId = (req, res, next) => {
    const { id } = req.params;

    if (!id || !/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid service ID. Must be a positive integer.'
        });
    }

    req.params.id = id;
    next();
};

const validateCreatePpcService = (req, res, next) => {
    const { service_type_id, service_english, service_urdu, service_abb } = req.body;
    const errors = [];
    const validatedBody = {};

    // service_type_id (Required)
    if (!service_type_id || !/^[1-9]\d*$/.test(String(service_type_id).trim())) {
        errors.push('Service type ID is required and must be a positive integer');
    } else {
        validatedBody.service_type_id = parseInt(String(service_type_id).trim(), 10);
    }

    // service_english (Required)
    if (!service_english || typeof service_english !== 'string' || service_english.trim() === '') {
        errors.push('Service name in English is required');
    } else {
        const trimmed = service_english.trim();
        if (trimmed.length < 2 || trimmed.length > 150) {
            errors.push('Service English name must be between 2 and 150 characters');
        } else {
            validatedBody.service_english = trimmed;
        }
    }

    // service_urdu (Optional)
    if (service_urdu !== undefined && service_urdu !== null) {
        if (typeof service_urdu !== 'string') {
            errors.push('Service Urdu name must be a string');
        } else {
            const trimmedUrdu = service_urdu.trim();
            if (trimmedUrdu.length > 150) {
                errors.push('Service Urdu name cannot exceed 150 characters');
            } else {
                validatedBody.service_urdu = trimmedUrdu || null;
            }
        }
    } else {
        validatedBody.service_urdu = null;
    }

    // service_abb (Optional)
    if (service_abb !== undefined && service_abb !== null) {
        if (typeof service_abb !== 'string') {
            errors.push('Abbreviation must be a string');
        } else {
            const trimmedAbb = service_abb.trim();
            if (trimmedAbb.length > 10) {
                errors.push('Abbreviation cannot exceed 10 characters');
            } else {
                validatedBody.service_abb = trimmedAbb ? trimmedAbb.toUpperCase() : null;
            }
        }
    } else {
        validatedBody.service_abb = null;
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
    validateGetPpcServices,
    validatePpcServiceId,
    validateCreatePpcService
};

