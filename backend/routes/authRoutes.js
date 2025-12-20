const express = require('express');
const router = express.Router();
const { signup, login, getCurrentUser, logout, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logout);

module.exports = router;
