const express = require('express');
const router = express.Router();

const referenceController = require('../../controller/Customer/ProfileReference/profileReference.controller');
const { authenticate } = require('../../middlewares/authMiddleware');

router.get('/identity-types', authenticate, referenceController.getIdentityTypes);
router.get('/countries', authenticate, referenceController.getCountries);
router.get('/titles', authenticate, referenceController.getCustomerTitles);
router.get('/genders', authenticate, referenceController.getGenders);

// Bootstrap API for Property Form reference data
router.get('/property-form', authenticate, referenceController.getPropertyFormData);

// Request Reference APIs
router.get('/property-purposes', authenticate, referenceController.getPropertyPurposes);
router.get('/ppc-services', authenticate, referenceController.getPPCServices);

// Autocomplete Location APIs
router.get('/cities', authenticate, referenceController.getCities);
router.get('/societies', authenticate, referenceController.getSocieties);
router.get('/areas', authenticate, referenceController.getAreas);

module.exports = router;
