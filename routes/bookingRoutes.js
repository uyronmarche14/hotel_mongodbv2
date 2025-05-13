const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Public route for checking availability
router.get('/check-availability', bookingController.checkAvailability);

// All other booking routes require authentication
router.use(protect);

// Create a new booking
router.post('/', bookingController.createBooking);

// Get all bookings (optionally filtered by email)
router.get('/', bookingController.getBookings);

// Get booking summary (counts of upcoming and past bookings)
router.get('/summary', bookingController.getBookingSummary);

// Get booking history with stats
router.get('/history', bookingController.getBookingHistory);

// Get booking history for a specific user
router.get('/history/:email', bookingController.getUserBookingHistory);

// Get a specific booking by ID
router.get('/:id', bookingController.getBookingById);

// Cancel a booking
router.put('/:id/cancel', bookingController.cancelBooking);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Booking service is running' });
});

module.exports = router; 