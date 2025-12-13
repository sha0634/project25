const express = require('express');
const router = express.Router();
const {
    getStudentProfile,
    updateStudentProfile,
    getCompanyProfile,
    updateCompanyProfile,
    uploadResume,
    uploadProfilePicture,
    deleteResume
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const multer = require('multer');
const path = require('path');

// Profile picture upload configuration
const pictureStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profile-pictures/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const pictureFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'), false);
    }
};

const uploadPicture = multer({
    storage: pictureStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: pictureFilter
});

// Common routes
router.post('/upload-picture', protect, (req, res, next) => {
    uploadPicture.single('profilePicture')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'Image size must be less than 2MB'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message
            });
        } else if (err) {
            // Custom errors (like file type validation)
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        // No error, proceed to controller
        next();
    });
}, uploadProfilePicture);

// Student profile routes
router.get('/student', protect, getStudentProfile);
router.put('/student', protect, updateStudentProfile);
router.post('/student/upload-resume', protect, (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size must be less than 5MB'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message
            });
        } else if (err) {
            // Custom errors (like file type validation)
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        // No error, proceed to controller
        next();
    });
}, uploadResume);
router.delete('/student/delete-resume', protect, deleteResume);

// Company profile routes
router.get('/company', protect, getCompanyProfile);
router.put('/company', protect, updateCompanyProfile);

module.exports = router;
