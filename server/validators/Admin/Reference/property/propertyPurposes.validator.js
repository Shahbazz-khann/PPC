const validateGetPropertyPurposes = (req, res, next) => {
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

module.exports = {
    validateGetPropertyPurposes
};
