const multer = require('multer');
const path = require('path');
const fs = require('fs');

// -------------------------------------------------------------------------
// Shared image file-type filter  (jpeg / png / webp only)
// -------------------------------------------------------------------------
const imageFileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const err = new Error('Unsupported file type. Only JPEG, PNG, and WebP are allowed.');
        err.statusCode = 400;
        cb(err, false);
    }
};

// -------------------------------------------------------------------------
// Profile Images
// -------------------------------------------------------------------------
const profileImagesDir = path.join(__dirname, '..', 'uploads', 'profile-images');
if (!fs.existsSync(profileImagesDir)) {
    fs.mkdirSync(profileImagesDir, { recursive: true });
}

const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, profileImagesDir); },
    filename: function (req, file, cb) {
        const userId = req.user ? req.user.user_id : 'unknown';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `profile-${userId}-${uniqueSuffix}${ext}`);
    }
});

const uploadProfileImage = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: imageFileFilter
});

// -------------------------------------------------------------------------
// Property Pictures
// -------------------------------------------------------------------------
const propertyPicturesDir = path.join(__dirname, '..', 'uploads', 'property-pictures');
if (!fs.existsSync(propertyPicturesDir)) {
    fs.mkdirSync(propertyPicturesDir, { recursive: true });
}

const propertyPicturesStorage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, propertyPicturesDir); },
    filename: function (req, file, cb) {
        const propertyId = req.params.propertyId || 'unknown';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `prop-${propertyId}-${uniqueSuffix}${ext}`);
    }
});

// Business limit: maximum 6 active pictures per property.
// multer.array cap = 6 (per-request guard); total active-count enforced in model.
const MAX_PROPERTY_PICTURES = 6;

const uploadPropertyPictures = multer({
    storage: propertyPicturesStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per image
    fileFilter: imageFileFilter
});

// -------------------------------------------------------------------------
// Property Videos  (MP4 only, 50 MB max, 1 per property enforced in model)
// -------------------------------------------------------------------------
const videoFileFilter = (req, file, cb) => {
    if (file.mimetype === 'video/mp4') {
        cb(null, true);
    } else {
        const err = new Error('Unsupported file type. Only MP4 videos are allowed.');
        err.statusCode = 400;
        cb(err, false);
    }
};

const propertyVideosDir = path.join(__dirname, '..', 'uploads', 'property-videos');
if (!fs.existsSync(propertyVideosDir)) {
    fs.mkdirSync(propertyVideosDir, { recursive: true });
}

const propertyVideosStorage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, propertyVideosDir); },
    filename: function (req, file, cb) {
        // prop-vid-{property_id}-{timestamp}-{random}.mp4
        const propertyId = req.params.propertyId || 'unknown';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `prop-vid-${propertyId}-${uniqueSuffix}.mp4`);
    }
});

// Business limit: 1 active video per property (enforced in DB transaction).
// Multer .single() enforces exactly one file per request at the HTTP level.
const uploadPropertyVideo = multer({
    storage: propertyVideosStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    fileFilter: videoFileFilter
});

module.exports = {
    uploadProfileImage,
    uploadPropertyPictures,
    MAX_PROPERTY_PICTURES,
    uploadPropertyVideo
};
