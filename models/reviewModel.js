const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    roomCategory: {
      type: String,
      required: true
    },
    roomTitle: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    images: [
      {
        type: String
      }
    ],
    likes: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    stayDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for efficient queries
reviewSchema.index({ roomCategory: 1, roomTitle: 1 });
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });  // One review per booking

module.exports = mongoose.model('Review', reviewSchema); 