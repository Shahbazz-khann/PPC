/**
 * Validator for Admin Property Inspections list query parameters.
 */
const validateGetInspections = (req, res, next) => {
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

  // 2. Status ('all' | 'verified' | 'issues flagged' | 'scheduled' | 'in progress')
  if (status !== undefined) {
    if (typeof status !== 'string') {
      errors.push('Status must be a string');
    } else {
      validatedQuery.status = status.trim();
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
 * Validator for single inspection by ID parameter.
 */
const validateInspectionId = (req, res, next) => {
  const { id } = req.params;

  if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['Inspection ID must be a positive integer'],
    });
  }

  next();
};

/**
 * Validator for updating a specific checklist item.
 */
const validateUpdateChecklistItem = (req, res, next) => {
  const { id, detailId } = req.params;
  const { status_id, remarks } = req.body;
  const errors = [];

  if (!id || !/^[1-9]\d*$/.test(String(id))) {
    errors.push('Inspection ID must be a positive integer');
  }

  if (!detailId || !/^[1-9]\d*$/.test(String(detailId))) {
    errors.push('Checklist detail ID must be a positive integer');
  }

  if (status_id !== undefined && status_id !== null) {
    const sId = parseInt(status_id, 10);
    if (![1, 2, 3, 4].includes(sId)) {
      errors.push('Status ID must be 1 (Verified), 2 (Not Verified), 3 (Partially Verified), or 4 (Not Applicable)');
    }
  }

  if (remarks !== undefined && remarks !== null && typeof remarks !== 'string') {
    errors.push('Remarks must be a string');
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
 * Validator for creating/scheduling a new inspection.
 */
const validateCreateInspection = (req, res, next) => {
  const { propertyId, inspectorId, scheduledDate } = req.body;
  const errors = [];

  if (!propertyId || !/^[1-9]\d*$/.test(String(propertyId))) {
    errors.push('Property ID is required and must be a positive integer');
  }

  if (!inspectorId || !/^[1-9]\d*$/.test(String(inspectorId))) {
    errors.push('Inspector employee ID is required and must be a positive integer');
  }

  if (!scheduledDate || typeof scheduledDate !== 'string' || scheduledDate.trim() === '') {
    errors.push('Scheduled date is required');
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
  validateGetInspections,
  validateInspectionId,
  validateUpdateChecklistItem,
  validateCreateInspection,
};
