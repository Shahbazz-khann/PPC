const express = require('express');
const router = express.Router();

const {
  getVisitStats,
  getVisits,
  getVisitById,
  getVisitOptions,
  createVisit,
  rescheduleVisit,
  completeVisit,
  cancelVisit,
  updateVisitRemarks,
} = require('../../controller/Admin/visits.controller');
const {
  validateGetVisits,
  validateVisitId,
  validateCreateVisit,
  validateRescheduleVisit,
  validateCompleteVisit,
} = require('../../validators/Admin/visits.validator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

/**
 * GET /api/v1/admin/visits/stats
 * Global summary metrics (total, scheduled, completed, overdue, cancelled).
 * Must be registered BEFORE /:id route.
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  getVisitStats
);

/**
 * GET /api/v1/admin/visits/options
 * Lookups for scheduling (properties, customers, employees).
 * Must be registered BEFORE /:id route.
 */
router.get(
  '/options',
  authenticate,
  authorize('admin'),
  getVisitOptions
);

/**
 * GET /api/v1/admin/visits
 * Paginated property visits list with multi-filtering and search.
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  validateGetVisits,
  getVisits
);

/**
 * POST /api/v1/admin/visits
 * Schedule a new property visit.
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateCreateVisit,
  createVisit
);

/**
 * GET /api/v1/admin/visits/:id
 * Retrieve 360-degree inspection detail for a single visit by ID.
 */
router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  validateVisitId,
  getVisitById
);

/**
 * PATCH /api/v1/admin/visits/:id/reschedule
 * Reschedule an existing visit.
 */
router.patch(
  '/:id/reschedule',
  authenticate,
  authorize('admin'),
  validateVisitId,
  validateRescheduleVisit,
  rescheduleVisit
);

/**
 * PATCH /api/v1/admin/visits/:id/complete
 * Record completion of a property visit.
 */
router.patch(
  '/:id/complete',
  authenticate,
  authorize('admin'),
  validateVisitId,
  validateCompleteVisit,
  completeVisit
);

/**
 * PATCH /api/v1/admin/visits/:id/remarks
 * Update PPC Representative findings/remarks directly.
 */
router.patch(
  '/:id/remarks',
  authenticate,
  authorize('admin'),
  validateVisitId,
  updateVisitRemarks
);

/**
 * PATCH /api/v1/admin/visits/:id/cancel
 * Cancel a property visit.
 */
router.patch(
  '/:id/cancel',
  authenticate,
  authorize('admin'),
  validateVisitId,
  cancelVisit
);

module.exports = router;
