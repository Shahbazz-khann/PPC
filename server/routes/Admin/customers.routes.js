const express = require('express');
const router = express.Router();

const {
  getCustomers,
  getCustomerStats,
  getCustomerById,
} = require('../../controller/Admin/customers.controller');
const {
  validateGetCustomers,
  validateCustomerId,
} = require('../../validators/Admin/customers.validator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

/**
 * GET /api/v1/admin/customers/stats
 * Retrieve global customer summary statistics.
 * Must be registered before any parameterized routes (e.g. /:id).
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  getCustomerStats
);

/**
 * GET /api/v1/admin/customers
 * Retrieve paginated customer list with search and status filtering.
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  validateGetCustomers,
  getCustomers
);

/**
 * GET /api/v1/admin/customers/:id
 * Retrieve single customer details by customer ID.
 */
router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  validateCustomerId,
  getCustomerById
);

module.exports = router;

