const express = require('express');
const router = express.Router();

const referenceController = require('../../controller/Customer/ProfileReference/profileReference.controller');
const { authenticate } = require('../../middlewares/authMiddleware');

router.get('/identity-types', authenticate, referenceController.getIdentityTypes);
router.get('/countries', authenticate, referenceController.getCountries);
router.get('/titles', authenticate, referenceController.getCustomerTitles);
router.get('/genders', authenticate, referenceController.getGenders);

module.exports = router;
