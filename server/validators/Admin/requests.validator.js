/**
 * Validator for Admin Customer Requests list request.
 * Validates query parameters: search, category, status, page, limit.
 * Populates req.validatedQuery for controller consumption.
 */
const validateGetRequests = (req, res, next) => {
  let { search, category, status, page, limit } = req.query;

  const errors = [];
  const validatedQuery = {};

  // 1. Search
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

  // 2. Category ('PROPERTY' | 'SERVICE' | 'all')
  if (category !== undefined) {
    if (typeof category !== 'string') {
      errors.push('Category must be a string');
    } else {
      const cat = category.trim().toUpperCase();
      if (!['PROPERTY', 'SERVICE', 'ALL'].includes(cat)) {
        errors.push("Category must be one of: 'PROPERTY', 'SERVICE', 'all'");
      } else {
        validatedQuery.category = cat;
      }
    }
  } else {
    validatedQuery.category = 'ALL';
  }

  // 3. Status ('all' or valid status)
  if (status !== undefined) {
    if (typeof status !== 'string') {
      errors.push('Status must be a string');
    } else {
      validatedQuery.status = status.trim();
    }
  } else {
    validatedQuery.status = 'all';
  }

  // 4. Page
  if (page !== undefined) {
    if (!/^[1-9]\d*$/.test(page)) {
      errors.push('Page must be a positive integer');
    } else {
      validatedQuery.page = parseInt(page, 10);
    }
  } else {
    validatedQuery.page = 1;
  }

  // 5. Limit
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
      errors,
    });
  }

  req.validatedQuery = validatedQuery;
  next();
};

/**
 * Validator for Admin Customer Requests single request by ID.
 * Validates route parameter req.params.id using positive integer regex.
 */
const validateRequestId = (req, res, next) => {
  const { id } = req.params;

  if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['Request ID must be a positive integer'],
    });
  }

  next();
};

/**
 * Validator for Admin Customer Request status update.
 * Validates req.params.id and req.body: status, remarks.
 */
const validateUpdateRequestStatus = (req, res, next) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  const errors = [];

  // Validate ID
  if (!id || typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) {
    errors.push('Request ID must be a positive integer');
  }

  // Allowed statuses matching customer_request_status_types
  const validStatuses = [
    'Pending',
    'Under Review',
    'Assigned',
    'In Progress',
    'Completed',
    'Rejected',
    'Withdrawn'
  ];

  if (!status || typeof status !== 'string') {
    errors.push('Status is required and must be a string');
  } else {
    const matchedStatus = validStatuses.find(
      (s) => s.toLowerCase() === status.trim().toLowerCase()
    );
    if (!matchedStatus) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    } else {
      req.validatedStatus = matchedStatus;
    }
  }

  // Validate optional remarks (<= 1000 characters)
  if (remarks !== undefined && remarks !== null) {
    if (typeof remarks !== 'string') {
      errors.push('Remarks must be a string');
    } else if (remarks.length > 1000) {
      errors.push('Remarks cannot exceed 1000 characters');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

module.exports = {
  validateGetRequests,
  validateRequestId,
  validateUpdateRequestStatus,
};
