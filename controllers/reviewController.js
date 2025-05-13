const asyncHandler = require('express-async-handler');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const mongoose = require('mongoose');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { 
    bookingId, 
    rating, 
    title, 
    comment, 
    images = []
  } = req.body;

  // Validate required fields
  if (!bookingId || !rating || !title || !comment) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: bookingId, rating, title, comment'
    });
  }

  // Convert bookingId to ObjectId if it's a string
  const bookingObjectId = mongoose.Types.ObjectId.isValid(bookingId) 
    ? new mongoose.Types.ObjectId(bookingId) 
    : null;

  if (!bookingObjectId) {
    return res.status(400).json({
      success: false,
      message: 'Invalid booking ID format'
    });
  }

  try {
    // Check if booking exists and belongs to the logged-in user
    const booking = await Booking.findOne({
      _id: bookingObjectId,
      user: req.user._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not associated with your account'
      });
    }

    // Check if booking is completed (user has stayed)
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot review a booking that is not completed'
      });
    }

    // Check if user already reviewed this booking
    const existingReview = await Review.findOne({
      booking: bookingObjectId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking',
        reviewId: existingReview._id
      });
    }

    // Create review
    const review = await Review.create({
      user: req.user._id,
      booking: bookingObjectId,
      roomCategory: booking.roomCategory,
      roomTitle: booking.roomTitle,
      rating,
      title,
      comment,
      images,
      stayDate: booking.checkOut // When they completed their stay
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get reviews for a specific room
// @route   GET /api/reviews/room/:category/:title
// @access  Public
const getRoomReviews = asyncHandler(async (req, res) => {
  const { category, title } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Get only approved reviews for this room, sorted by newest first
    const reviews = await Review.find({
      roomCategory: category,
      roomTitle: title,
      status: 'approved'
    })
      .populate('user', 'name profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCount = await Review.countDocuments({
      roomCategory: category,
      roomTitle: title,
      status: 'approved'
    });

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      {
        $match: {
          roomCategory: category,
          roomTitle: title,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingCounts: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Process rating distribution if stats exist
    let ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    let averageRating = 0;
    
    if (ratingStats.length > 0) {
      averageRating = ratingStats[0].averageRating;
      
      // Count occurrences of each rating
      ratingStats[0].ratingCounts.forEach(rating => {
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          totalCount
        },
        stats: {
          averageRating,
          ratingDistribution
        }
      }
    });
  } catch (error) {
    console.error('Error getting room reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get user's reviews
// @route   GET /api/reviews/user
// @access  Private
const getUserReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Get all reviews by the logged-in user
    const reviews = await Review.find({ user: req.user._id })
      .populate('booking', 'bookingId checkIn checkOut roomImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCount = await Review.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          totalCount
        }
      }
    });
  } catch (error) {
    console.error('Error getting user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, title, comment, images } = req.body;

  try {
    // Check if review exists and belongs to the logged-in user
    const review = await Review.findOne({
      _id: id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or not associated with your account'
      });
    }

    // Update review fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    // Reset status to pending for re-approval
    review.status = 'pending';

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Check if review exists and belongs to the logged-in user
    const review = await Review.findOne({
      _id: id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or not associated with your account'
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Admin: Approve or reject a review
// @route   PATCH /api/reviews/:id/status
// @access  Private/Admin
const updateReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid status: approved or rejected'
    });
  }

  try {
    // Only admins can update status
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to perform this action'
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = status;
    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${status}`,
      data: review
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = {
  createReview,
  getRoomReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  updateReviewStatus
}; 