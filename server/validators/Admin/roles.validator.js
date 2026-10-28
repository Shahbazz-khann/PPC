const { isValidPageKey } = require('../../config/adminPageRegistry');

/**
 * @file roles.validator.js
 * @description Request validators for Admin Role Management endpoints.
 * Strictly adheres to:
 * - Positive BIGINT string validation for :roleId (^[1-9]\d*$)
 * - Strict boolean validation for can_access (no strings, numbers, or coercion)
 * - Canonical page_key validation against adminPageRegistry
 * - Disallowing duplicate page keys
 * - Rejecting unexpected payload properties (no client-supplied role_id, user_id, or audit actor)
 */

const ROLE_ID_REGEX = /^[1-9]\d*$/;

/**
 * Validator for GET /api/v1/admin/roles/:roleId/page-access
 */
const validateGetRolePageAccess = (req, res, next) => {
  const { roleId } = req.params;

  if (!roleId || typeof roleId !== 'string' || !ROLE_ID_REGEX.test(roleId.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Role ID parameter',
      errors: ['Role ID must be a positive integer string'],
    });
  }

  next();
};

/**
 * Validator for PUT /api/v1/admin/roles/:roleId/page-access
 */
const validatePutRolePageAccess = (req, res, next) => {
  const { roleId } = req.params;
  const errors = [];

  // 1. Validate route param roleId
  if (!roleId || typeof roleId !== 'string' || !ROLE_ID_REGEX.test(roleId.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Role ID parameter',
      errors: ['Role ID must be a positive integer string'],
    });
  }

  // 2. Validate request body structure
  let rawPermissions;

  if (Array.isArray(req.body)) {
    rawPermissions = req.body;
  } else if (typeof req.body === 'object' && req.body !== null) {
    // Check for unexpected top-level fields
    const extraTopKeys = Object.keys(req.body).filter((key) => key !== 'permissions');
    if (extraTopKeys.length > 0) {
      errors.push(`Unexpected top-level field(s) in payload: ${extraTopKeys.join(', ')}`);
    }

    if (Array.isArray(req.body.permissions)) {
      rawPermissions = req.body.permissions;
    } else {
      errors.push('The "permissions" field must be an array of permission objects');
    }
  } else {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['Request body must be an array of permissions or an object with a "permissions" array'],
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // 3. Validate permissions array content
  if (!Array.isArray(rawPermissions) || rawPermissions.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['Permissions array cannot be empty'],
    });
  }

  const seenKeys = new Set();
  const validatedList = [];

  for (let i = 0; i < rawPermissions.length; i++) {
    const item = rawPermissions[i];

    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      errors.push(`Permission item at index ${i} must be an object`);
      continue;
    }

    // Check for unexpected fields in permission item
    const extraItemKeys = Object.keys(item).filter(
      (k) => k !== 'page_key' && k !== 'can_access'
    );
    if (extraItemKeys.length > 0) {
      errors.push(
        `Unexpected field(s) [${extraItemKeys.join(', ')}] in permission item at index ${i}`
      );
    }

    // Validate page_key
    if (typeof item.page_key !== 'string' || item.page_key.trim() === '') {
      errors.push(`Permission item at index ${i} requires a non-empty string page_key`);
      continue;
    }

    const trimmedKey = item.page_key.trim();

    if (!isValidPageKey(trimmedKey)) {
      errors.push(`Unknown or invalid canonical page_key: '${item.page_key}'`);
    }

    // Duplicate key validation
    if (seenKeys.has(trimmedKey)) {
      errors.push(`Duplicate page_key found in payload: '${trimmedKey}'`);
    }
    seenKeys.add(trimmedKey);

    // Strict boolean validation (no string "true", 1, 0, null, etc.)
    if (typeof item.can_access !== 'boolean') {
      errors.push(
        `can_access must be a strict boolean (true or false) for page_key: '${trimmedKey}'`
      );
    }

    if (errors.length === 0) {
      validatedList.push({
        page_key: trimmedKey,
        can_access: item.can_access,
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.validatedBody = {
    permissions: validatedList,
  };

  next();
};

module.exports = {
  validateGetRolePageAccess,
  validatePutRolePageAccess,
};
