const express = require('express');
const router = express.Router();

const { getCountries, createCountry, updateCountry, deleteCountry } = require('../../../../controller/Admin/Reference/location/countries.controller');
const { validateGetCountries, validateCreateCountry, validateCountryId, validateUpdateCountry } = require('../../../../validators/Admin/Reference/location/countries.validator');
const { authenticate, authorize } = require('../../../../middlewares/authMiddleware');

router.get(
    '/',
    authenticate,
    authorize('admin'),
    validateGetCountries,
    getCountries
);

router.post(
    '/',
    authenticate,
    authorize('admin'),
    validateCreateCountry,
    createCountry
);

router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    validateCountryId,
    validateUpdateCountry,
    updateCountry
);

router.delete(
    '/:id',
    authenticate,
    authorize('admin'),
    validateCountryId,
    deleteCountry
);

module.exports = router;
