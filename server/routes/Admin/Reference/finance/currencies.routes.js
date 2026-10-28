const express = require('express');
const router = express.Router();

const {
  getCurrencies,
  getCurrencyById,
  createCurrency,
  updateCurrency,
  deleteCurrency
} = require('../../../../controller/Admin/Reference/finance/currencies.controller');

const {
  validateGetCurrencies,
  validateCurrencyId,
  validateCreateCurrency,
  validateUpdateCurrency
} = require('../../../../validators/Admin/Reference/finance/currencies.validator');

const { authenticate, authorizePageAccess } = require('../../../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../../../config/adminPageRegistry');

router.get(
  '/',
  authenticate,
  authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_CURRENCIES),
  validateGetCurrencies,
  getCurrencies
);

router.get(
  '/:id',
  authenticate,
  authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_CURRENCIES),
  validateCurrencyId,
  getCurrencyById
);

router.post(
  '/',
  authenticate,
  authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_CURRENCIES),
  validateCreateCurrency,
  createCurrency
);

router.put(
  '/:id',
  authenticate,
  authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_CURRENCIES),
  validateCurrencyId,
  validateUpdateCurrency,
  updateCurrency
);

router.delete(
  '/:id',
  authenticate,
  authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_CURRENCIES),
  validateCurrencyId,
  deleteCurrency
);

module.exports = router;
