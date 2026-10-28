const {
  getAdminProperties: fetchAdminProperties,
  getAdminPropertyStats: fetchAdminPropertyStats,
  getAdminPropertyById: fetchAdminPropertyById,
  updateAdminPropertyApproval,
  createAdminProperty,
  uploadAdminPropertyPictures: saveAdminPropertyPictures,
  uploadAdminPropertyVideo: saveAdminPropertyVideo,
} = require('../../models/Admin/properties.model');
const logger = require('../../utils/logger');
const { notifyUser } = require('../../services/notification.service');

/**
 * Controller handler for Admin Property list.
 * GET /api/v1/admin/properties
 */
const getProperties = async (req, res) => {
  try {
    const {
      search,
      approval_stage,
      status,
      demand_type,
      property_type,
      page,
      limit,
    } = req.validatedQuery;

    const result = await fetchAdminProperties({
      search,
      approval_stage,
      status,
      demand_type,
      property_type,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: 'Properties retrieved successfully',
      data: result.rows,
      pagination: result.pagination,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getProperties controller:', error);
    } else {
      console.error('Error in getProperties controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching properties',
      data: [],
    });
  }
};

/**
 * Controller handler for Admin Property summary statistics.
 * GET /api/v1/admin/properties/stats
 */
const getPropertyStats = async (req, res) => {
  try {
    const stats = await fetchAdminPropertyStats();

    return res.status(200).json({
      success: true,
      message: 'Property statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getPropertyStats controller:', error);
    } else {
      console.error('Error in getPropertyStats controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching property statistics',
      data: {},
    });
  }
};

/**
 * Controller handler for Admin Property details by ID.
 * GET /api/v1/admin/properties/:id
 */
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await fetchAdminPropertyById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Property retrieved successfully',
      data: property,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getPropertyById controller:', error);
    } else {
      console.error('Error in getPropertyById controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching property details',
    });
  }
};

/**
 * Controller handler for updating property approval stage.
 * PATCH /api/v1/admin/properties/:id/approval
 */
const updatePropertyApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approval_stage, remarks } = req.body;
    const userId = req.user?.user_id || null;

    const result = await updateAdminPropertyApproval(id, approval_stage, remarks, userId);

    // Notify property owner of approval status change
    if (result && result.user_id) {
      notifyUser({
        userId: result.user_id,
        actorId: userId,
        title: `Property Stage Updated: ${result.approval_stage}`,
        message: `Your property (#${id}) stage has been updated to "${result.approval_stage}".`,
        type: 'property',
        linkUrl: `/customer/properties/${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Property approval stage updated to "${result.approval_stage}" successfully`,
      data: result,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in updatePropertyApproval controller:', error);
    } else {
      console.error('Error in updatePropertyApproval controller:', error);
    }

    if (error.message === 'Property not found') {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred while updating approval stage',
    });
  }
};

/**
 * Controller handler for registering a new property as an Admin.
 * POST /api/v1/admin/properties
 */
const createProperty = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const result = await createAdminProperty(req.body, userId);

    return res.status(201).json({
      success: true,
      message: `Property ${result.formatted_id} registered successfully`,
      data: result,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in createProperty controller:', error);
    } else {
      console.error('Error in createProperty controller:', error);
    }

    if (error.message.includes('Customer not found') || error.message.includes('Selected area not found')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred while registering the property',
    });
  }
};

/**
 * Controller handler for uploading property pictures by Admin.
 * POST /api/v1/admin/properties/:id/pictures
 */
const uploadPropertyPictures = async (req, res) => {
  const cleanupFiles = () => {
    if (req.files && Array.isArray(req.files)) {
      const fs = require('fs');
      const path = require('path');
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '../../uploads/property-pictures', file.filename);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (_) {}
        }
      });
    }
  };

  try {
    const propertyId = req.params.id;
    const userId = req.user?.user_id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pictures supplied. Please upload at least one image file.',
      });
    }

    const pictureUrls = req.files.map(
      file => `/uploads/property-pictures/${file.filename}`
    );

    const insertedPictures = await saveAdminPropertyPictures(
      propertyId,
      userId,
      pictureUrls
    );

    return res.status(201).json({
      success: true,
      message: 'Property pictures uploaded successfully',
      data: {
        property_id: propertyId,
        pictures: insertedPictures,
      },
    });
  } catch (error) {
    cleanupFiles();
    if (logger && logger.error) {
      logger.error('Error in uploadPropertyPictures controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while uploading pictures',
    });
  }
};

/**
 * Controller handler for uploading property video by Admin.
 * POST /api/v1/admin/properties/:id/video
 */
const uploadPropertyVideo = async (req, res) => {
  const cleanupFile = () => {
    if (req.file) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../../uploads/property-videos', req.file.filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) {}
      }
    }
  };

  try {
    const propertyId = req.params.id;
    const userId = req.user?.user_id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file supplied.',
      });
    }

    const videoUrl = `/uploads/property-videos/${req.file.filename}`;
    const insertedVideo = await saveAdminPropertyVideo(propertyId, userId, videoUrl);

    return res.status(201).json({
      success: true,
      message: 'Property video uploaded successfully',
      data: {
        property_id: propertyId,
        video: insertedVideo,
      },
    });
  } catch (error) {
    cleanupFile();
    if (logger && logger.error) {
      logger.error('Error in uploadPropertyVideo controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while uploading video',
    });
  }
};

module.exports = {
  getProperties,
  getPropertyStats,
  getPropertyById,
  updatePropertyApproval,
  createProperty,
  uploadPropertyPictures,
  uploadPropertyVideo,
};


