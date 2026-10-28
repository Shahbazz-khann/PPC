const express = require('express');
const router = express.Router();

const {
  getProperties,
  getPropertyStats,
  getPropertyById,
  updatePropertyApproval,
  createProperty,
  uploadPropertyPictures,
  uploadPropertyVideo,
} = require('../../controller/Admin/properties.controller');
const {
  validateGetProperties,
  validatePropertyId,
  validateUpdatePropertyApproval,
  validateCreateAdminProperty,
} = require('../../validators/Admin/properties.validator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');
const { uploadPropertyPictures: multerPropertyPictures, MAX_PROPERTY_PICTURES, uploadPropertyVideo: multerPropertyVideo } = require('../../middlewares/uploadMiddleware');

/**
 * GET /api/v1/admin/properties/stats
 * Global summary metrics (total, pending, active, for sale, for rent).
 * Must be registered BEFORE /:id route.
 */
router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  getPropertyStats
);

/**
 * GET /api/v1/admin/properties
 * Paginated property inventory list with search & multi-filtering.
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  validateGetProperties,
  getProperties
);

/**
 * POST /api/v1/admin/properties
 * Registers a new property under a designated customer.
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateCreateAdminProperty,
  createProperty
);

/**
 * POST /api/v1/admin/properties/:id/pictures
 * Uploads photos for a property.
 */
router.post(
  '/:id/pictures',
  authenticate,
  authorize('admin'),
  validatePropertyId,
  (req, res, next) => {
    multerPropertyPictures.array('pictures', MAX_PROPERTY_PICTURES)(req, res, (err) => {
      if (!err) return next();
      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, message: `Maximum ${MAX_PROPERTY_PICTURES} pictures are allowed per request.` });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Each image must not exceed 5 MB.' });
      }
      if (err.statusCode === 400) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    });
  },
  uploadPropertyPictures
);

/**
 * POST /api/v1/admin/properties/:id/video
 * Uploads video walkthrough for a property.
 */
router.post(
  '/:id/video',
  authenticate,
  authorize('admin'),
  validatePropertyId,
  (req, res, next) => {
    multerPropertyVideo.single('video')(req, res, (err) => {
      if (!err) return next();
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Video file must not exceed 50 MB.' });
      }
      if (err.statusCode === 400) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next(err);
    });
  },
  uploadPropertyVideo
);

/**
 * GET /api/v1/admin/properties/:id
 * Retrieve 360-degree inspection detail for a single property by ID.
 */
router.get(
  '/:id',
  authenticate,
  authorize('admin'),
  validatePropertyId,
  getPropertyById
);

/**
 * PATCH /api/v1/admin/properties/:id/approval
 * Updates approval stage for a single property by ID.
 */
router.patch(
  '/:id/approval',
  authenticate,
  authorize('admin'),
  validateUpdatePropertyApproval,
  updatePropertyApproval
);

module.exports = router;


