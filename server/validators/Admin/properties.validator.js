/**
 * Validator for Admin Property Operations GET list request.
 * Validates query parameters: search, approval_stage, status, demand_type, property_type, page, limit.
 * Populates req.validatedQuery for controller consumption.
 */
const validateGetProperties = (req, res, next) => {
  let { search, approval_stage, status, demand_type, property_type, page, limit } = req.query;

  const errors = [];
  const validatedQuery = {};

  // 1. Search (optional string)
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

  // 2. Approval stage (optional, default: 'all')
  if (approval_stage !== undefined) {
    if (typeof approval_stage !== 'string') {
      errors.push('Approval stage must be a string');
    } else {
      validatedQuery.approval_stage = approval_stage.trim();
    }
  } else {
    validatedQuery.approval_stage = 'all';
  }

  // 3. Status (optional, default: 'all')
  if (status !== undefined) {
    if (typeof status !== 'string') {
      errors.push('Status must be a string');
    } else {
      validatedQuery.status = status.trim();
    }
  } else {
    validatedQuery.status = 'all';
  }

  // 4. Demand type (optional, default: 'all')
  if (demand_type !== undefined) {
    if (typeof demand_type !== 'string') {
      errors.push('Demand type must be a string');
    } else {
      validatedQuery.demand_type = demand_type.trim();
    }
  } else {
    validatedQuery.demand_type = 'all';
  }

  // 5. Property type (optional, default: 'all')
  if (property_type !== undefined) {
    if (typeof property_type !== 'string') {
      errors.push('Property type must be a string');
    } else {
      validatedQuery.property_type = property_type.trim();
    }
  } else {
    validatedQuery.property_type = 'all';
  }

  // 6. Page (optional positive integer, default: 1)
  if (page !== undefined) {
    if (!/^[1-9]\d*$/.test(page)) {
      errors.push('Page must be a positive integer');
    } else {
      validatedQuery.page = parseInt(page, 10);
    }
  } else {
    validatedQuery.page = 1;
  }

  // 7. Limit (optional positive integer, default: 10)
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
 * Validator for Admin Property Operations GET single property by ID.
 * Validates route parameter req.params.id using positive integer regex.
 */
const validatePropertyId = (req, res, next) => {
  const { id } = req.params;

  if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['Property ID must be a positive integer'],
    });
  }

  next();
};

/**
 * Validator for Admin Property Approval stage update request.
 * PATCH /api/v1/admin/properties/:id/approval
 * Body: { approval_stage: string, remarks?: string }
 */
const validateUpdatePropertyApproval = (req, res, next) => {
  const { id } = req.params;
  let { approval_stage, remarks } = req.body;

  const errors = [];

  // 1. Property ID
  if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) {
    errors.push('Property ID must be a positive integer');
  }

  // 2. Approval stage
  const validStages = ['pending', 'under review', 'approved', 'rejected'];
  if (!approval_stage || typeof approval_stage !== 'string') {
    errors.push('approval_stage is required and must be a string');
  } else if (!validStages.includes(approval_stage.trim().toLowerCase())) {
    errors.push("Invalid approval_stage. Must be one of: 'Pending', 'Under Review', 'Approved', 'Rejected'");
  } else {
    const lower = approval_stage.trim().toLowerCase();
    if (lower === 'under review') {
      req.body.approval_stage = 'Under Review';
    } else {
      req.body.approval_stage = lower.charAt(0).toUpperCase() + lower.slice(1);
    }
  }

  // 3. Remarks (optional string)
  if (remarks !== undefined && remarks !== null) {
    if (typeof remarks !== 'string') {
      errors.push('remarks must be a string');
    } else if (remarks.length > 1000) {
      errors.push('remarks cannot exceed 1000 characters');
    } else {
      req.body.remarks = remarks.trim();
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
 * Validator for Admin Property Registration request.
 * POST /api/v1/admin/properties
 */
const validateCreateAdminProperty = (req, res, next) => {
  const { customerId, area_id, propertyType, propertySize, sizeUom } = req.body;
  const errors = [];

  if (!customerId || !/^[1-9]\d*$/.test(String(customerId).trim())) {
    errors.push('customerId is required and must be a valid ID');
  }

  if (!area_id || !/^[1-9]\d*$/.test(String(area_id).trim())) {
    errors.push('area_id is required and must be a valid ID');
  }

  if (!propertyType || !/^[1-9]\d*$/.test(String(propertyType).trim())) {
    errors.push('propertyType is required');
  }

  if (!propertySize || isNaN(Number(propertySize)) || Number(propertySize) <= 0) {
    errors.push('propertySize is required and must be a positive number');
  }

  if (!sizeUom || !/^[1-9]\d*$/.test(String(sizeUom).trim())) {
    errors.push('sizeUom is required');
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
  validateGetProperties,
  validatePropertyId,
  validateUpdatePropertyApproval,
  validateCreateAdminProperty,
};


