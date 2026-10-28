const express = require('express');
const router = express.Router();

const {
  getRequestStats,
  getRequests,
  getRequestById,
  updateRequestStatus,
} = require('../../controller/Admin/requests.controller');
const {
  validateGetRequests,
  validateRequestId,
  validateUpdateRequestStatus,
} = require('../../validators/Admin/requests.validator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

/**
 * GET /api/v1/admin/requests/stats
 * Global summary metrics (total, pending, in operations, completed, category split).
 * Must be registered BEFORE /:id route.
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  getRequestStats
);

/**
 * GET /api/v1/admin/requests
 * Paginated customer requests list with search & multi-filtering.
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  validateGetRequests,
  getRequests
);

/**
 * GET /api/v1/admin/requests/:id
 * Retrieve 360-degree inspection detail for a single customer request by ID.
 */
router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequestId,
  getRequestById
);

/**
 * PATCH /api/v1/admin/requests/:id/status
 * Updates workflow status and logs audit remarks in status history.
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validateUpdateRequestStatus,
  updateRequestStatus
);

module.exports = router;
