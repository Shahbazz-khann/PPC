const {
  getAdminVisitStats: fetchAdminVisitStats,
  getAdminVisits: fetchAdminVisits,
  getAdminVisitById: fetchAdminVisitById,
  getAdminVisitOptions: fetchAdminVisitOptions,
  createAdminVisit,
  rescheduleAdminVisit,
  completeAdminVisit,
  cancelAdminVisit,
  updateAdminVisitRemarks,
} = require('../../models/Admin/visits.model');
const logger = require('../../utils/logger');
const { notifyUser } = require('../../services/notification.service');

/**
 * Controller handler for Admin Property Visits summary statistics.
 * GET /api/v1/admin/visits/stats
 */
const getVisitStats = async (req, res) => {
  try {
    const stats = await fetchAdminVisitStats();

    return res.status(200).json({
      success: true,
      message: 'Property visit statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getVisitStats controller:', error);
    } else {
      console.error('Error in getVisitStats controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching visit statistics',
      data: {},
    });
  }
};

/**
 * Controller handler for Admin Property Visits list.
 * GET /api/v1/admin/visits
 */
const getVisits = async (req, res) => {
  try {
    const {
      search,
      status,
      page,
      limit,
    } = req.validatedQuery;

    const result = await fetchAdminVisits({
      search,
      status,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: 'Property visits retrieved successfully',
      data: result.rows,
      pagination: result.pagination,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getVisits controller:', error);
    } else {
      console.error('Error in getVisits controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching property visits',
      data: [],
    });
  }
};

/**
 * Controller handler for Admin Property Visit detail by ID.
 * GET /api/v1/admin/visits/:id
 */
const getVisitById = async (req, res) => {
  try {
    const { id } = req.params;
    const visit = await fetchAdminVisitById(id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Property visit not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Property visit retrieved successfully',
      data: visit,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getVisitById controller:', error);
    } else {
      console.error('Error in getVisitById controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching visit details',
    });
  }
};

/**
 * Controller handler for Schedule Visit lookups/options.
 * GET /api/v1/admin/visits/options
 */
const getVisitOptions = async (req, res) => {
  try {
    const options = await fetchAdminVisitOptions();
    return res.status(200).json({
      success: true,
      message: 'Visit scheduling options retrieved successfully',
      data: options,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getVisitOptions controller:', error);
    } else {
      console.error('Error in getVisitOptions controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch visit scheduling options',
      data: { properties: [], customers: [], employees: [] },
    });
  }
};

/**
 * Controller handler for scheduling a new Property Visit.
 * POST /api/v1/admin/visits
 */
const createVisit = async (req, res) => {
  try {
    const adminUserId = req.user?.user_id;
    const visit = await createAdminVisit(req.body, adminUserId);

    // Notify customer that visit has been scheduled
    if (visit && visit.user_id) {
      notifyUser({
        userId: visit.user_id,
        actorId: adminUserId,
        title: 'Property Visit Scheduled',
        message: `A visit (${visit.formatted_id || `#${visit.id}`}) has been scheduled for ${visit.visit_scheduled_date} at ${visit.visit_scheduled_time}.`,
        type: 'visit',
        linkUrl: `/customer/visits`,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Property visit scheduled successfully',
      data: visit,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in createVisit controller:', error);
    } else {
      console.error('Error in createVisit controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to schedule property visit',
    });
  }
};

/**
 * Controller handler for rescheduling a visit.
 * PATCH /api/v1/admin/visits/:id/reschedule
 */
const rescheduleVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime, reason } = req.body;
    const visit = await rescheduleAdminVisit(id, { newDate, newTime, reason });

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Property visit not found or inactive',
      });
    }

    // Notify customer that visit has been rescheduled
    if (visit.user_id) {
      notifyUser({
        userId: visit.user_id,
        actorId: req.user?.user_id,
        title: 'Property Visit Rescheduled',
        message: `Your visit (${visit.formatted_id || `#${id}`}) has been rescheduled to ${newDate} at ${newTime}.`,
        type: 'visit',
        linkUrl: `/customer/visits`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Property visit rescheduled successfully',
      data: visit,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in rescheduleVisit controller:', error);
    } else {
      console.error('Error in rescheduleVisit controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to reschedule property visit',
    });
  }
};

/**
 * Controller handler for completing a visit.
 * PATCH /api/v1/admin/visits/:id/complete
 */
const completeVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualDate, actualTime, remarks } = req.body;
    const visit = await completeAdminVisit(id, { actualDate, actualTime, remarks });

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Property visit not found or inactive',
      });
    }

    // Notify customer that visit has been completed
    if (visit.user_id) {
      notifyUser({
        userId: visit.user_id,
        actorId: req.user?.user_id,
        title: 'Property Visit Completed',
        message: `Your visit (${visit.formatted_id || `#${id}`}) has been completed.`,
        type: 'visit',
        linkUrl: `/customer/visits`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Property visit marked as completed',
      data: visit,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in completeVisit controller:', error);
    } else {
      console.error('Error in completeVisit controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to record visit completion',
    });
  }
};

/**
 * Controller handler for cancelling a visit.
 * PATCH /api/v1/admin/visits/:id/cancel
 */
const cancelVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const visit = await cancelAdminVisit(id, { reason });

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Property visit not found',
      });
    }

    // Notify customer that visit has been cancelled
    if (visit.user_id) {
      notifyUser({
        userId: visit.user_id,
        actorId: req.user?.user_id,
        title: 'Property Visit Cancelled',
        message: `Your property visit (${visit.formatted_id || `#${id}`}) was cancelled.${reason ? ` Reason: ${reason}` : ''}`,
        type: 'visit',
        linkUrl: `/customer/visits`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Property visit cancelled successfully',
      data: visit,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in cancelVisit controller:', error);
    } else {
      console.error('Error in cancelVisit controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel property visit',
    });
  }
};

/**
 * Controller handler for updating PPC Representative findings/remarks.
 * PATCH /api/v1/admin/visits/:id/remarks
 */
const updateVisitRemarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const visit = await updateAdminVisitRemarks(id, { remarks });

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Property visit not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inspection findings updated successfully',
      data: visit,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in updateVisitRemarks controller:', error);
    } else {
      console.error('Error in updateVisitRemarks controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to update inspection findings',
    });
  }
};

module.exports = {
  getVisitStats,
  getVisits,
  getVisitById,
  getVisitOptions,
  createVisit,
  rescheduleVisit,
  completeVisit,
  cancelVisit,
  updateVisitRemarks,
};
