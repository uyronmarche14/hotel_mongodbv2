const express = require('express');
const router = express.Router();
const { 
  createReview,
  getRoomReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  updateReviewStatus
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/room/:category/:title', getRoomReviews);

// Protected routes for logged-in users
router.post('/', protect, createReview);
router.get('/user', protect, getUserReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Admin routes
router.patch('/:id/status', protect, admin, updateReviewStatus);

module.exports = router; 