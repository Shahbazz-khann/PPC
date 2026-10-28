/**
 * Validator for Admin Property Visits list request.
 * Validates query parameters: search, status, page, limit.
 * Populates req.validatedQuery for controller consumption.
 */
const validateGetVisits = (req, res, next) => {
  let { search, status, page, limit } = req.query;

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

  // 2. Status ('all' | 'Scheduled' | 'Completed' | 'Overdue' | 'Cancelled')
  if (status !== undefined) {
    if (typeof status !== 'string') {
      errors.push('Status must be a string');
    } else {
      const s = status.trim().toLowerCase();
      const validStatuses = ['all', 'scheduled', 'completed', 'overdue', 'cancelled'];
      if (!validStatuses.includes(s)) {
        errors.push("Status must be one of: 'all', 'Scheduled', 'Completed', 'Overdue', 'Cancelled'");
      } else {
        validatedQuery.status = s;
      }
    }
  } else {
    validatedQuery.status = 'all';
  }

  // 3. Page
  if (page !== undefined) {
    if (!/^[1-9]\d*$/.test(page)) {
      errors.push('Page must be a positive integer');
    } else {
      validatedQuery.page = parseInt(page, 10);
    }
  } else {
    validatedQuery.page = 1;
  }

  // 4. Limit
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
 * Validator for Admin Property Visits single visit by ID.
 * Validates route parameter req.params.id using positive integer regex.
 */
const validateVisitId = (req, res, next) => {
  const { id } = req.params;

  if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['Visit ID must be a positive integer'],
    });
  }

  next();
};

/**
 * Validator for Scheduling a new Property Visit (POST /api/v1/admin/visits).
 */
const validateCreateVisit = (req, res, next) => {
  const { propertyId, customerId, scheduledDate, scheduledTime, employeeId, notes } = req.body;
  const errors = [];

  if (!propertyId || !/^[1-9]\d*$/.test(String(propertyId))) {
    errors.push('Target Property is required and must be a valid ID.');
  }

  if (!customerId || !/^[1-9]\d*$/.test(String(customerId))) {
    errors.push('Visitor Customer is required and must be a valid ID.');
  }

  if (!scheduledDate || typeof scheduledDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate.trim())) {
    errors.push('Scheduled date is required in YYYY-MM-DD format.');
  }

  if (employeeId !== undefined && employeeId !== null && employeeId !== '') {
    if (!/^[1-9]\d*$/.test(String(employeeId))) {
      errors.push('Field Officer ID must be a positive integer if provided.');
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

/**
 * Validator for Rescheduling a Property Visit.
 */
const validateRescheduleVisit = (req, res, next) => {
  const { newDate } = req.body;
  const errors = [];

  if (!newDate || typeof newDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(newDate.trim())) {
    errors.push('New scheduled date is required in YYYY-MM-DD format.');
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

/**
 * Validator for Completing a Property Visit.
 */
const validateCompleteVisit = (req, res, next) => {
  const { actualDate } = req.body;
  const errors = [];

  if (actualDate && (typeof actualDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(actualDate.trim()))) {
    errors.push('Actual date must be in YYYY-MM-DD format if provided.');
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
  validateGetVisits,
  validateVisitId,
  validateCreateVisit,
  validateRescheduleVisit,
  validateCompleteVisit,
};
