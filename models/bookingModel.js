const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      required: true,
    },
    roomTitle: {
      type: String,
      required: true,
    },
    roomCategory: {
      type: String,
      required: true,
    },
    roomImage: {
      type: String,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    nights: {
      type: Number,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
    },
    specialRequests: {
      type: String,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    taxAndFees: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    location: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for efficient availability searching
bookingSchema.index({ roomTitle: 1, roomCategory: 1, status: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });

module.exports = mongoose.model('Booking', bookingSchema); 