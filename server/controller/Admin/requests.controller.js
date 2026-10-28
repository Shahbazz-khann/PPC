const {
  getAdminRequestStats: fetchAdminRequestStats,
  getAdminRequests: fetchAdminRequests,
  getAdminRequestById: fetchAdminRequestById,
  updateAdminRequestStatus: modifyAdminRequestStatus,
} = require('../../models/Admin/requests.model');
const logger = require('../../utils/logger');
const { notifyUser } = require('../../services/notification.service');

/**
 * Controller handler for Admin Customer Requests summary statistics.
 * GET /api/v1/admin/requests/stats
 */
const getRequestStats = async (req, res) => {
  try {
    const stats = await fetchAdminRequestStats();

    return res.status(200).json({
      success: true,
      message: 'Request statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getRequestStats controller:', error);
    } else {
      console.error('Error in getRequestStats controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching request statistics',
      data: {},
    });
  }
};

/**
 * Controller handler for Admin Customer Requests list.
 * GET /api/v1/admin/requests
 */
const getRequests = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      page,
      limit,
    } = req.validatedQuery;

    const result = await fetchAdminRequests({
      search,
      category,
      status,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: 'Customer requests retrieved successfully',
      data: result.rows,
      pagination: result.pagination,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getRequests controller:', error);
    } else {
      console.error('Error in getRequests controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching customer requests',
      data: [],
    });
  }
};

/**
 * Controller handler for Admin Customer Request detail by ID.
 * GET /api/v1/admin/requests/:id
 */
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await fetchAdminRequestById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Customer request not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Customer request retrieved successfully',
      data: request,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getRequestById controller:', error);
    } else {
      console.error('Error in getRequestById controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching request details',
    });
  }
};

/**
 * Controller handler for Admin Customer Request status update.
 * PATCH /api/v1/admin/requests/:id/status
 */
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = req.validatedStatus;
    const remarks = typeof req.body.remarks === 'string' ? req.body.remarks.trim() : null;
    const userId = req.user?.user_id || null;

    const updatedRequest = await modifyAdminRequestStatus(id, status, remarks, userId);

    // Notify customer that request status has been updated
    if (updatedRequest && updatedRequest.user_id) {
      notifyUser({
        userId: updatedRequest.user_id,
        actorId: userId,
        title: `Request Status: ${status}`,
        message: `Your request (${updatedRequest.formatted_id || `#${id}`}) status has been updated to "${status}".`,
        type: 'request',
        linkUrl: `/customer/requests`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Customer request status updated to "${status}" successfully`,
      data: updatedRequest,
    });
  } catch (error) {
    if (error.message === 'Customer request not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('Invalid status')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (logger && logger.error) {
      logger.error('Error in updateRequestStatus controller:', error);
    } else {
      console.error('Error in updateRequestStatus controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while updating customer request status',
    });
  }
};

module.exports = {
  getRequestStats,
  getRequests,
  getRequestById,
  updateRequestStatus,
};
