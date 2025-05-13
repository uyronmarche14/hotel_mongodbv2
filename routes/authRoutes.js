const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfilePicture } = require('../middleware/uploadMiddleware');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get user data
router.get('/me', protect, authController.getMe);

// Update user profile
router.put('/profile', protect, uploadProfilePicture, authController.updateProfile);

module.exports = router; 