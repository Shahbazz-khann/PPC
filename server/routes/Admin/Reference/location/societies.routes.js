const express = require('express');
const router = express.Router();
const societiesController = require('../../../../controller/Admin/Reference/location/societies.controller');
const { validateGetSocieties, validateCreateSociety, validateSocietyId, validateUpdateSociety } = require('../../../../validators/Admin/Reference/location/societies.validator');
const { authenticate, authorizePageAccess } = require('../../../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../../../config/adminPageRegistry');

// Apply authentication and page authorization to all routes in this file
router.use(authenticate);
router.use(authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_SOCIETIES));

// GET /api/v1/admin/reference/location/societies
router.get('/', validateGetSocieties, societiesController.getSocieties);

// POST /api/v1/admin/reference/location/societies
router.post('/', validateCreateSociety, societiesController.createSociety);

// PUT /api/v1/admin/reference/location/societies/:id
router.put('/:id', validateSocietyId, validateUpdateSociety, societiesController.updateSociety);

// DELETE /api/v1/admin/reference/location/societies/:id
router.delete('/:id', validateSocietyId, societiesController.deleteSociety);

module.exports = router;
