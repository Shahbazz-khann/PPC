const {
  getAdminDashboardSummary: fetchDashboardSummary,
  getAdminDashboardActivity: fetchDashboardActivity,
  getAdminDashboardOverview: fetchDashboardOverview
} = require('../../models/Admin/dashboard.model');
const logger = require('../../utils/logger');

/**
 * Controller handler for Admin Dashboard full overview.
 * GET /api/v1/admin/dashboard
 */
const getOverview = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const overview = await fetchDashboardOverview(limit);

    return res.status(200).json({
      success: true,
      message: 'Admin dashboard overview retrieved successfully',
      data: overview
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in Admin Dashboard getOverview controller:', error);
    } else {
      console.error('Error in Admin Dashboard getOverview controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard overview',
      data: null
    });
  }
};

/**
 * Controller handler for Admin Dashboard KPI summary metrics.
 * GET /api/v1/admin/dashboard/summary
 */
const getSummary = async (req, res, next) => {
  try {
    const summary = await fetchDashboardSummary();

    return res.status(200).json({
      success: true,
      message: 'Admin dashboard summary retrieved successfully',
      data: summary
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in Admin Dashboard getSummary controller:', error);
    } else {
      console.error('Error in Admin Dashboard getSummary controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard summary',
      data: null
    });
  }
};

/**
 * Controller handler for Admin Dashboard live activity streams.
 * GET /api/v1/admin/dashboard/activity
 */
const getActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const activity = await fetchDashboardActivity(limit);

    return res.status(200).json({
      success: true,
      message: 'Admin dashboard activity retrieved successfully',
      data: activity
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in Admin Dashboard getActivity controller:', error);
    } else {
      console.error('Error in Admin Dashboard getActivity controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard activity',
      data: null
    });
  }
};

module.exports = {
  getOverview,
  getSummary,
  getActivity
};
