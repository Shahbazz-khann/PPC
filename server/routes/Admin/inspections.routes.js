const express = require('express');
const router = express.Router();

const {
  getInspectionStats,
  getInspections,
  getInspectionById,
  updateInspectionFindings,
  updateChecklistItem,
  getInspectionOptions,
  createInspection,
} = require('../../controller/Admin/inspections.controller');
const {
  validateGetInspections,
  validateInspectionId,
  validateUpdateChecklistItem,
  validateCreateInspection,
} = require('../../validators/Admin/inspections.validator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

/**
 * GET /api/v1/admin/inspections/stats
 * Global summary metrics (total, verified, flagged, scheduled).
 * Registered before /:id route.
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  getInspectionStats
);

/**
 * GET /api/v1/admin/inspections/options
 * Dropdown lookup options (active properties and field inspectors).
 * Registered before /:id route.
 */
router.get(
  '/options',
  authenticate,
  authorize('admin'),
  getInspectionOptions
);

/**
 * POST /api/v1/admin/inspections
 * Schedule a new property inspection.
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateCreateInspection,
  createInspection
);

/**
 * GET /api/v1/admin/inspections
 * Paginated list of inspection reports with search and status filtering.
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  validateGetInspections,
  getInspections
);

/**
 * GET /api/v1/admin/inspections/:id
 * Retrieve 360-degree inspection detail for a single inspection report by ID.
 */
router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  validateInspectionId,
  getInspectionById
);

/**
 * PATCH /api/v1/admin/inspections/:id/findings
 * Update findings and remarks directly by Super Admin.
 */
router.patch(
  '/:id/findings',
  authenticate,
  authorize('admin'),
  validateInspectionId,
  updateInspectionFindings
);

/**
 * PATCH /api/v1/admin/inspections/:id/checklist/:detailId
 * Update an individual checklist item's status and remarks directly by Super Admin.
 */
router.patch(
  '/:id/checklist/:detailId',
  authenticate,
  authorize('admin'),
  validateUpdateChecklistItem,
  updateChecklistItem
);

module.exports = router;
