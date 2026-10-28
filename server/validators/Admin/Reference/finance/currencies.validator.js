/**
 * Validator for Currencies Reference Table operations.
 */

const validateGetCurrencies = (req, res, next) => {
  let { search, status } = req.query;
  const errors = [];

  if (search !== undefined) {
    if (typeof search !== 'string') {
      errors.push('Search parameter must be a string');
    } else {
      search = search.trim();
      if (search === '') {
        delete req.query.search;
      } else {
        req.query.search = search;
      }
    }
  }

  if (status !== undefined) {
    if (typeof status !== 'string') {
      errors.push('Status parameter must be a string');
    } else {
      status = status.trim().toLowerCase();
      if (!['active', 'inactive', 'all'].includes(status)) {
        errors.push('Status must be "active", "inactive", or "all"');
      } else {
        req.query.status = status;
      }
    }
  } else {
    req.query.status = 'all';
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateCurrencyId = (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(id) || parseInt(id, 10) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid currency ID. Must be a positive integer.'
    });
  }

  req.params.id = parseInt(id, 10);
  next();
};

const validateCreateCurrency = (req, res, next) => {
  let { currency_english, currency_urdu, currency_code, currency_symbol, is_active } = req.body;
  const errors = [];

  if (!currency_english || typeof currency_english !== 'string' || currency_english.trim() === '') {
    errors.push('Currency English name is required');
  } else if (currency_english.trim().length > 100) {
    errors.push('Currency English name cannot exceed 100 characters');
  }

  if (currency_urdu !== undefined && currency_urdu !== null && currency_urdu !== '') {
    if (typeof currency_urdu !== 'string') {
      errors.push('Currency Urdu name must be a string');
    } else if (currency_urdu.trim().length > 100) {
      errors.push('Currency Urdu name cannot exceed 100 characters');
    }
  }

  if (!currency_code || typeof currency_code !== 'string' || currency_code.trim() === '') {
    errors.push('Currency Code is required (e.g. PKR, USD)');
  } else if (currency_code.trim().length < 2 || currency_code.trim().length > 5) {
    errors.push('Currency Code must be between 2 and 5 characters');
  }

  if (currency_symbol !== undefined && currency_symbol !== null && currency_symbol !== '') {
    if (typeof currency_symbol !== 'string') {
      errors.push('Currency Symbol must be a string');
    } else if (currency_symbol.trim().length > 10) {
      errors.push('Currency Symbol cannot exceed 10 characters');
    }
  }

  if (is_active !== undefined && typeof is_active !== 'boolean') {
    errors.push('is_active must be a boolean');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  req.body.currency_english = currency_english.trim();
  req.body.currency_urdu = currency_urdu ? currency_urdu.trim() : null;
  req.body.currency_code = currency_code.trim().toUpperCase();
  req.body.currency_symbol = currency_symbol ? currency_symbol.trim() : null;
  req.body.is_active = is_active === undefined ? true : Boolean(is_active);

  next();
};

const validateUpdateCurrency = (req, res, next) => {
  let { currency_english, currency_urdu, currency_code, currency_symbol, is_active } = req.body;
  const errors = [];

  if (currency_english === undefined || typeof currency_english !== 'string' || currency_english.trim() === '') {
    errors.push('Currency English name is required');
  } else if (currency_english.trim().length > 100) {
    errors.push('Currency English name cannot exceed 100 characters');
  }

  if (currency_urdu !== undefined && currency_urdu !== null && currency_urdu !== '') {
    if (typeof currency_urdu !== 'string') {
      errors.push('Currency Urdu name must be a string');
    } else if (currency_urdu.trim().length > 100) {
      errors.push('Currency Urdu name cannot exceed 100 characters');
    }
  }

  if (currency_code === undefined || typeof currency_code !== 'string' || currency_code.trim() === '') {
    errors.push('Currency Code is required');
  } else if (currency_code.trim().length < 2 || currency_code.trim().length > 5) {
    errors.push('Currency Code must be between 2 and 5 characters');
  }

  if (currency_symbol !== undefined && currency_symbol !== null && currency_symbol !== '') {
    if (typeof currency_symbol !== 'string') {
      errors.push('Currency Symbol must be a string');
    } else if (currency_symbol.trim().length > 10) {
      errors.push('Currency Symbol cannot exceed 10 characters');
    }
  }

  if (is_active === undefined || typeof is_active !== 'boolean') {
    errors.push('is_active is required and must be a boolean');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  req.body.currency_english = currency_english.trim();
  req.body.currency_urdu = currency_urdu ? currency_urdu.trim() : null;
  req.body.currency_code = currency_code.trim().toUpperCase();
  req.body.currency_symbol = currency_symbol ? currency_symbol.trim() : null;
  req.body.is_active = Boolean(is_active);

  next();
};

module.exports = {
  validateGetCurrencies,
  validateCurrencyId,
  validateCreateCurrency,
  validateUpdateCurrency
};
