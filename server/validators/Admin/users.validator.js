/**
 * Validator for Admin User Directory GET requests.
 * Validates and normalizes query parameters: search, userTypeId, roleId, status, page, limit.
 */
const validateGetAdminUsers = (req, res, next) => {
  let { search, userTypeId, roleId, status, page, limit } = req.query;

  const errors = [];
  const validatedQuery = {};

  // 1. Search validation & normalization
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

  // 2. Status validation & normalization (default: 'all')
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

  // 3. User Type ID validation (optional positive integer string)
  if (userTypeId !== undefined) {
    if (typeof userTypeId !== 'string') {
      errors.push('User Type ID must be a string');
    } else {
      userTypeId = userTypeId.trim();
      if (userTypeId === '' || !/^[1-9]\d*$/.test(userTypeId)) {
        errors.push('Invalid User Type ID format');
      } else {
        validatedQuery.userTypeId = userTypeId;
      }
    }
  }

  // 4. Role ID validation (optional positive integer string OR 'no-role')
  if (roleId !== undefined) {
    if (typeof roleId !== 'string') {
      errors.push('Role ID must be a string');
    } else {
      roleId = roleId.trim();
      const lowerRoleId = roleId.toLowerCase();
      if (lowerRoleId === 'no-role') {
        validatedQuery.roleId = 'no-role';
      } else if (/^[1-9]\d*$/.test(roleId)) {
        validatedQuery.roleId = roleId;
      } else {
        errors.push("Role ID must be a positive integer or 'no-role'");
      }
    }
  }

  // 5. Page validation (optional positive integer, default: 1)
  if (page !== undefined) {
    if (!/^[1-9]\d*$/.test(page)) {
      errors.push('Page must be a positive integer');
    } else {
      validatedQuery.page = parseInt(page, 10);
    }
  } else {
    validatedQuery.page = 1;
  }

  // 6. Limit validation (optional positive integer, default: 10)
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

  // Explicit validated query hand-off (never mutate req.query)
  req.validatedQuery = validatedQuery;
  next();
};

/**
 * Validator for Admin User PUT update requests.
 */
const validateUpdateAdminUser = (req, res, next) => {
  const { userId } = req.params;
  const {
    user_first_name,
    user_middle_name,
    user_last_name,
    email,
    mobile,
    role_ids,
    is_active,
  } = req.body;

  const errors = [];
  const validatedBody = {};

  // 1. Param userId validation
  if (!userId || !/^[1-9]\d*$/.test(String(userId).trim())) {
    errors.push('Invalid User ID parameter');
  }

  // 2. First Name
  if (user_first_name !== undefined) {
    if (typeof user_first_name !== 'string' || user_first_name.trim() === '') {
      errors.push('First name cannot be empty');
    } else if (user_first_name.trim().length > 100) {
      errors.push('First name must not exceed 100 characters');
    } else {
      validatedBody.user_first_name = user_first_name.trim();
    }
  }

  // 3. Middle Name
  if (user_middle_name !== undefined && user_middle_name !== null) {
    if (typeof user_middle_name !== 'string') {
      errors.push('Middle name must be a string');
    } else if (user_middle_name.trim().length > 100) {
      errors.push('Middle name must not exceed 100 characters');
    } else {
      validatedBody.user_middle_name = user_middle_name.trim();
    }
  } else if (user_middle_name === null) {
    validatedBody.user_middle_name = null;
  }

  // 4. Last Name
  if (user_last_name !== undefined) {
    if (typeof user_last_name !== 'string' || user_last_name.trim() === '') {
      errors.push('Last name cannot be empty');
    } else if (user_last_name.trim().length > 100) {
      errors.push('Last name must not exceed 100 characters');
    } else {
      validatedBody.user_last_name = user_last_name.trim();
    }
  }

  // 5. Email
  if (email !== undefined) {
    if (typeof email !== 'string' || email.trim() === '') {
      errors.push('Email cannot be empty');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push('Invalid email format');
      } else if (email.trim().length > 255) {
        errors.push('Email must not exceed 255 characters');
      } else {
        validatedBody.email = email.trim().toLowerCase();
      }
    }
  }

  // 6. Mobile
  if (mobile !== undefined) {
    if (typeof mobile !== 'string' || mobile.trim() === '') {
      errors.push('Mobile number cannot be empty');
    } else if (mobile.trim().length > 20) {
      errors.push('Mobile number must not exceed 20 characters');
    } else {
      validatedBody.mobile = mobile.trim();
    }
  }

  // 7. Roles
  if (role_ids !== undefined) {
    if (!Array.isArray(role_ids)) {
      errors.push('role_ids must be an array of role IDs');
    } else {
      const validRoleIds = [];
      for (const rId of role_ids) {
        if (!/^[1-9]\d*$/.test(String(rId).trim())) {
          errors.push(`Invalid role ID: ${rId}`);
          break;
        }
        validRoleIds.push(String(rId).trim());
      }
      validatedBody.role_ids = validRoleIds;
    }
  }

  // 8. is_active
  if (is_active !== undefined) {
    if (typeof is_active !== 'boolean') {
      errors.push('is_active must be a boolean');
    } else {
      validatedBody.is_active = is_active;
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.validatedBody = validatedBody;
  next();
};

/**
 * Validator for Admin User DELETE requests.
 */
const validateDeleteAdminUser = (req, res, next) => {
  const { userId } = req.params;

  if (!userId || !/^[1-9]\d*$/.test(String(userId).trim())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid User ID parameter',
    });
  }

  next();
};

module.exports = {
  validateGetAdminUsers,
  validateUpdateAdminUser,
  validateDeleteAdminUser,
};
