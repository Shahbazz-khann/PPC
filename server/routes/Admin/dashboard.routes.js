const express = require('express');
const router = express.Router();

const {
  getOverview,
  getSummary,
  getActivity
} = require('../../controller/Admin/dashboard.controller');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

/**
 * GET /api/v1/admin/dashboard
 * Full executive overview (combined summary KPIs + recent activity streams).
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  getOverview
);

/**
 * GET /api/v1/admin/dashboard/summary
 * Aggregated executive summary KPI statistics & triage radar counts.
 */
router.get(
  '/summary',
  authenticate,
  authorize('admin'),
  getSummary
);

/**
 * GET /api/v1/admin/dashboard/activity
 * Top recent operational activity records (properties, requests, visits).
 */
router.get(
  '/activity',
  authenticate,
  authorize('admin'),
  getActivity
);

module.exports = router;
