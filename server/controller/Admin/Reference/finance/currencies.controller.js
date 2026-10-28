const logger = require('../../../../utils/logger');
const {
  getAdminCurrencies,
  getAdminCurrencyById,
  findCurrencyByEnglishInsensitive,
  findCurrencyByCodeInsensitive,
  findCurrencyByEnglishInsensitiveExcludingId,
  findCurrencyByCodeInsensitiveExcludingId,
  createAdminCurrency,
  updateAdminCurrency,
  getCurrencyDependencies,
  deleteAdminCurrency
} = require('../../../../models/Admin/Reference/finance/currencies.model');

/**
 * GET /api/v1/admin/reference/finance/currencies
 */
const getCurrencies = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const currencies = await getAdminCurrencies({ search, status });

    return res.status(200).json({
      success: true,
      message: 'Currencies retrieved successfully',
      data: currencies
    });
  } catch (error) {
    logger.error('Get Admin Currencies Error:', error);
    next(error);
  }
};

/**
 * GET /api/v1/admin/reference/finance/currencies/:id
 */
const getCurrencyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currency = await getAdminCurrencyById(id);

    if (!currency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Currency retrieved successfully',
      data: currency
    });
  } catch (error) {
    logger.error('Get Admin Currency By ID Error:', error);
    next(error);
  }
};

/**
 * POST /api/v1/admin/reference/finance/currencies
 */
const createCurrency = async (req, res, next) => {
  try {
    const { currency_english, currency_urdu, currency_code, currency_symbol, is_active } = req.body;

    // 1. Check duplicate English name
    const englishExists = await findCurrencyByEnglishInsensitive(currency_english);
    if (englishExists) {
      return res.status(409).json({
        success: false,
        message: `Currency with English name "${currency_english}" already exists`
      });
    }

    // 2. Check duplicate Code
    const codeExists = await findCurrencyByCodeInsensitive(currency_code);
    if (codeExists) {
      return res.status(409).json({
        success: false,
        message: `Currency code "${currency_code}" already exists`
      });
    }

    // 3. Create currency
    const newCurrency = await createAdminCurrency({
      currency_english,
      currency_urdu,
      currency_code,
      currency_symbol,
      is_active
    });

    return res.status(201).json({
      success: true,
      message: 'Currency created successfully',
      data: newCurrency
    });
  } catch (error) {
    logger.error('Create Admin Currency Error:', error);
    next(error);
  }
};

/**
 * PUT /api/v1/admin/reference/finance/currencies/:id
 */
const updateCurrency = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currency_english, currency_urdu, currency_code, currency_symbol, is_active } = req.body;

    const existing = await getAdminCurrencyById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    // Check duplicate English name excluding this id
    const englishExists = await findCurrencyByEnglishInsensitiveExcludingId(currency_english, id);
    if (englishExists) {
      return res.status(409).json({
        success: false,
        message: `Currency with English name "${currency_english}" already exists`
      });
    }

    // Check duplicate Code excluding this id
    const codeExists = await findCurrencyByCodeInsensitiveExcludingId(currency_code, id);
    if (codeExists) {
      return res.status(409).json({
        success: false,
        message: `Currency code "${currency_code}" already exists`
      });
    }

    const updated = await updateAdminCurrency(id, {
      currency_english,
      currency_urdu,
      currency_code,
      currency_symbol,
      is_active
    });

    return res.status(200).json({
      success: true,
      message: 'Currency updated successfully',
      data: updated
    });
  } catch (error) {
    logger.error('Update Admin Currency Error:', error);
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/reference/finance/currencies/:id
 */
const deleteCurrency = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await getAdminCurrencyById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found'
      });
    }

    // Check dependencies
    const dependencies = await getCurrencyDependencies(id);
    if (dependencies.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete currency because it is referenced by existing property demands.',
        dependencies
      });
    }

    await deleteAdminCurrency(id);

    return res.status(200).json({
      success: true,
      message: 'Currency deleted successfully',
      data: { currency_id: id }
    });
  } catch (error) {
    logger.error('Delete Admin Currency Error:', error);
    next(error);
  }
};

module.exports = {
  getCurrencies,
  getCurrencyById,
  createCurrency,
  updateCurrency,
  deleteCurrency
};
