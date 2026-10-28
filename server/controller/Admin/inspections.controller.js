const {
  getAdminInspectionStats: fetchInspectionStats,
  getAdminInspections: fetchInspections,
  getAdminInspectionById: fetchInspectionById,
  updateAdminInspectionFindings: updateInspectionFindingsModel,
  updateAdminInspectionChecklistItem: updateInspectionChecklistItemModel,
  getAdminInspectionOptions: fetchInspectionOptionsModel,
  createAdminInspection: createInspectionModel,
} = require('../../models/Admin/inspections.model');
const logger = require('../../utils/logger');
const { notifyUser } = require('../../services/notification.service');

/**
 * Controller handler for Admin Property Inspections summary statistics.
 * GET /api/v1/admin/inspections/stats
 */
const getInspectionStats = async (req, res) => {
  try {
    const stats = await fetchInspectionStats();
    return res.status(200).json({
      success: true,
      message: 'Inspection statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getInspectionStats controller:', error);
    } else {
      console.error('Error in getInspectionStats controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching inspection statistics',
      data: { total: 0, verified: 0, flagged: 0, scheduled: 0 },
    });
  }
};

/**
 * Controller handler for Admin Property Inspections paginated list.
 * GET /api/v1/admin/inspections
 */
const getInspections = async (req, res) => {
  try {
    const { search, status, page, limit } = req.validatedQuery;
    const result = await fetchInspections({ search, status, page, limit });

    return res.status(200).json({
      success: true,
      message: 'Inspection reports retrieved successfully',
      data: result.rows,
      pagination: result.pagination,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getInspections controller:', error);
    } else {
      console.error('Error in getInspections controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching inspection reports',
      data: [],
    });
  }
};

/**
 * Controller handler for single inspection report by ID.
 * GET /api/v1/admin/inspections/:id
 */
const getInspectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const inspection = await fetchInspectionById(id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection report not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inspection report retrieved successfully',
      data: inspection,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getInspectionById controller:', error);
    } else {
      console.error('Error in getInspectionById controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching inspection report details',
    });
  }
};

/**
 * Controller handler for updating inspection findings.
 * PATCH /api/v1/admin/inspections/:id/findings
 */
const updateInspectionFindings = async (req, res) => {
  try {
    const { id } = req.params;
    const { findings, remarks } = req.body;
    const inspection = await updateInspectionFindingsModel(id, { findings, remarks });

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection report not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inspection report findings updated successfully',
      data: inspection,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in updateInspectionFindings controller:', error);
    } else {
      console.error('Error in updateInspectionFindings controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to update inspection report findings',
    });
  }
};

/**
 * Controller handler for updating an individual checklist item.
 * PATCH /api/v1/admin/inspections/:id/checklist/:detailId
 */
const updateChecklistItem = async (req, res) => {
  try {
    const { id, detailId } = req.params;
    const { status_id, remarks } = req.body;

    const updatedItem = await updateInspectionChecklistItemModel(id, detailId, { status_id, remarks });

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Checklist item not found or could not be updated',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Checklist item updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in updateChecklistItem controller:', error);
    } else {
      console.error('Error in updateChecklistItem controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to update checklist item',
    });
  }
};

/**
 * Controller handler for dropdown options (active properties and field inspectors).
 * GET /api/v1/admin/inspections/options
 */
const getInspectionOptions = async (req, res) => {
  try {
    const options = await fetchInspectionOptionsModel();
    return res.status(200).json({
      success: true,
      message: 'Inspection options retrieved successfully',
      data: options,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getInspectionOptions controller:', error);
    } else {
      console.error('Error in getInspectionOptions controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve inspection options',
      data: { properties: [], inspectors: [] },
    });
  }
};

/**
 * Controller handler for scheduling a new property inspection.
 * POST /api/v1/admin/inspections
 */
const createInspection = async (req, res) => {
  try {
    const adminUserId = req.user?.user_id || req.user?.id || null;
    const newInspection = await createInspectionModel(req.body, adminUserId);

    // Notify customer that an inspection has been scheduled for their property
    if (newInspection && newInspection.user_id) {
      notifyUser({
        userId: newInspection.user_id,
        actorId: adminUserId,
        title: 'Inspection Scheduled',
        message: `An on-site inspection (${newInspection.formatted_id || `#${newInspection.id}`}) has been scheduled for property ${newInspection.property_title || newInspection.formatted_property_id}.`,
        type: 'inspection',
        linkUrl: `/customer/inspection-reports`,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Property inspection scheduled successfully',
      data: newInspection,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in createInspection controller:', error);
    } else {
      console.error('Error in createInspection controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to schedule property inspection',
    });
  }
};

module.exports = {
  getInspectionStats,
  getInspections,
  getInspectionById,
  updateInspectionFindings,
  updateChecklistItem,
  getInspectionOptions,
  createInspection,
};
