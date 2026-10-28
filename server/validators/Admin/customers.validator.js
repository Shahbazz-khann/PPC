/**
 * Validator for Admin Customer Operations GET list request.
 * Validates and normalizes query parameters: search, status, page, limit.
 * Populates req.validatedQuery for controller consumption.
 */
const validateGetCustomers = (req, res, next) => {
  let { search, status, page, limit } = req.query;

  const errors = [];
  const validatedQuery = {};

  // 1. Search validation & normalization (optional string)
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

  // 2. Status validation & normalization (optional, default: 'all')
  if (status !== undefined) {
    if (typeof status !== 'string') {
      errors.push('Status must be a string');
    } else {
      status = status.trim().toLowerCase();
      if (!['all', 'active', 'inactive'].includes(status)) {
        errors.push("Status must be 'all', 'active', or 'inactive'");
      } else {
        validatedQuery.status = status;
      }
    }
  } else {
    validatedQuery.status = 'all';
  }

  // 3. Page validation (optional positive whole integer, default: 1)
  if (page !== undefined) {
    if (!/^[1-9]\d*$/.test(page)) {
      errors.push('Page must be a positive integer');
    } else {
      validatedQuery.page = parseInt(page, 10);
    }
  } else {
    validatedQuery.page = 1;
  }

  // 4. Limit validation (optional positive whole integer, default: 10)
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

  // Explicit validated query hand-off (never mutate req.query directly)
  req.validatedQuery = validatedQuery;
  next();
};

/**
 * Validator for Admin Customer Operations GET single customer by ID.
 * Validates route parameter req.params.id using positive integer regex.
 * Preserves raw string representation without numerical conversion.
 */
const validateCustomerId = (req, res, next) => {
  const { id } = req.params;

  if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['Customer ID must be a positive integer'],
    });
  }

  next();
};

module.exports = {
  validateGetCustomers,
  validateCustomerId,
};

