const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/profile-images directory exists
const profileImagesDir = path.join(__dirname, '..', 'uploads', 'profile-images');
if (!fs.existsSync(profileImagesDir)) {
    fs.mkdirSync(profileImagesDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profileImagesDir);
    },
    filename: function (req, file, cb) {
        // profile-{user_id}-{timestamp}.ext
        const userId = req.user ? req.user.user_id : 'unknown';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `profile-${userId}-${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const err = new Error('Unsupported file type. Only JPEG, PNG, and WebP are allowed.');
        err.statusCode = 400;
        cb(err, false);
    }
};

// Export configured multer
const uploadProfileImage = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
    fileFilter: fileFilter
});

module.exports = {
    uploadProfileImage
};
