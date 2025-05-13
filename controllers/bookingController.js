const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');
const Booking = require('../models/bookingModel');

// In-memory storage for bookings (replace with MongoDB in production)
const bookings = [];

// Create a new booking
const createBooking = asyncHandler(async (req, res) => {
  const bookingData = req.body;
  
  // Validate essential fields
  if (!bookingData.firstName || !bookingData.email || !bookingData.roomTitle) {
    return res.status(400).json({
      success: false,
      message: 'Missing required booking information',
    });
  }

  // Format dates correctly
  const checkIn = new Date(bookingData.checkIn);
  const checkOut = new Date(bookingData.checkOut);
  
  // Generate a unique booking ID 
  const bookingId = `BK${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
  
  try {
    // Check if the room is available for these dates
    const isAvailable = await checkRoomAvailability(
      bookingData.roomCategory, 
      bookingData.roomTitle,
      checkIn,
      checkOut
    );
    
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the selected dates',
      });
    }
    
    // Create the booking document
    const newBooking = new Booking({
      ...bookingData,
      bookingId,
      user: req.user ? req.user._id : null,
      checkIn,
      checkOut,
      status: 'confirmed', // Automatically confirm for simplicity
      paymentStatus: 'paid', // Assume payment is successful for simplicity
    });
    
    // Save to database
    await newBooking.save();
    
    // For backward compatibility with in-memory mode
    bookings.push({
      _id: newBooking._id.toString(),
      ...newBooking.toObject(),
      createdAt: newBooking.createdAt.toISOString(),
    });
    
    res.status(201).json({
      success: true,
      data: newBooking,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message,
    });
  }
});

// Helper function to check room availability
const checkRoomAvailability = async (roomCategory, roomTitle, checkIn, checkOut) => {
  // Check if there are any overlapping bookings
  const overlappingBookings = await Booking.find({
    roomTitle,
    roomCategory,
    status: { $nin: ['cancelled'] },
    $or: [
      // Case 1: New check-in is during an existing booking
      {
        checkIn: { $lte: checkIn },
        checkOut: { $gt: checkIn }
      },
      // Case 2: New check-out is during an existing booking
      {
        checkIn: { $lt: checkOut },
        checkOut: { $gte: checkOut }
      },
      // Case 3: New booking completely contains an existing booking
      {
        checkIn: { $gte: checkIn },
        checkOut: { $lte: checkOut }
      }
    ]
  });

  // If there are no overlapping bookings, room is available
  return overlappingBookings.length === 0;
};

// Get all bookings (optionally filtered by email)
const getBookings = asyncHandler(async (req, res) => {
  const { email } = req.query;
  
  try {
    let query = {};
    
    // If email is provided, filter by it
    if (email) {
      query.email = email;
    }
    
    // If user is not admin, limit to their own bookings
    if (req.user && req.user.role !== 'admin') {
      query.email = req.user.email;
    }
    
    // Query the database
    const bookingsFromDB = await Booking.find(query).sort({ createdAt: -1 });
    
    // Return results
    res.status(200).json({
      success: true,
      count: bookingsFromDB.length,
      data: bookingsFromDB
    });
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get a booking by ID
const getBookingById = asyncHandler(async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user has permission to view this booking
    if (req.user.role !== 'admin' && booking.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error getting booking by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Cancel a booking
const cancelBooking = asyncHandler(async (req, res) => {
  try {
    // Find the booking
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user has permission to cancel this booking
    if (req.user.role !== 'admin' && booking.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Check if booking is already cancelled or completed
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save();
    
    // For in-memory compatibility, also update the in-memory booking
    const index = bookings.findIndex(b => b._id === req.params.id);
    if (index !== -1) {
      bookings[index].status = 'cancelled';
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get booking history with analytics
const getBookingHistory = asyncHandler(async (req, res) => {
  try {
    // Query all bookings if admin, or just user's bookings if regular user
    const query = req.user.role === 'admin' ? {} : { email: req.user.email };
    
    // Get all bookings
    const allBookings = await Booking.find(query);
    
    // Calculate stats
    const totalBookings = allBookings.length;
    const completedBookings = allBookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = allBookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = allBookings
      .filter(b => b.status !== 'cancelled')
      .reduce((total, booking) => total + booking.totalPrice, 0);
    
    // Group bookings by room type
    const roomTypes = {};
    
    allBookings.forEach(booking => {
      const key = `${booking.roomType}-${booking.roomTitle}`;
      
      if (!roomTypes[key]) {
        roomTypes[key] = {
          roomType: booking.roomType,
          roomTitle: booking.roomTitle,
          count: 0,
          totalRevenue: 0,
          imageUrl: booking.roomImage,
          bookings: []
        };
      }
      
      roomTypes[key].count++;
      if (booking.status !== 'cancelled') {
        roomTypes[key].totalRevenue += booking.totalPrice;
      }
      
      // Add simplified booking data
      roomTypes[key].bookings.push({
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        nights: booking.nights,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt
      });
    });
    
    // Convert to array and sort by count
    const roomStats = Object.values(roomTypes).sort((a, b) => b.count - a.count);
    
    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue
      },
      roomStats
    });
  } catch (error) {
    console.error('Error getting booking history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get booking history for a specific user
const getUserBookingHistory = asyncHandler(async (req, res) => {
  try {
    const { email } = req.params;
    
    // Check authorization - only allow admins or the user themselves
    if (req.user.role !== 'admin' && req.user.email !== email) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s booking history'
      });
    }
    
    // Get all bookings for this user
    const userBookings = await Booking.find({ email });
    
    // Calculate stats
    const totalBookings = userBookings.length;
    const completedBookings = userBookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = userBookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = userBookings
      .filter(b => b.status !== 'cancelled')
      .reduce((total, booking) => total + booking.totalPrice, 0);
    
    // Group bookings by room type
    const roomTypes = {};
    
    userBookings.forEach(booking => {
      const key = `${booking.roomType}-${booking.roomTitle}`;
      
      if (!roomTypes[key]) {
        roomTypes[key] = {
          roomType: booking.roomType,
          roomTitle: booking.roomTitle,
          count: 0,
          totalRevenue: 0,
          imageUrl: booking.roomImage,
          bookings: []
        };
      }
      
      roomTypes[key].count++;
      if (booking.status !== 'cancelled') {
        roomTypes[key].totalRevenue += booking.totalPrice;
      }
      
      // Add simplified booking data
      roomTypes[key].bookings.push({
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        nights: booking.nights,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt
      });
    });
    
    // Convert to array and sort by count
    const roomStats = Object.values(roomTypes).sort((a, b) => b.count - a.count);
    
    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue
      },
      roomStats
    });
  } catch (error) {
    console.error('Error getting user booking history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Check if a room is available for the specified dates
// @route   GET /api/bookings/check-availability
// @access  Public
const checkAvailability = asyncHandler(async (req, res) => {
  const { roomCategory, roomTitle, checkIn, checkOut, guests } = req.query;
  
  // Basic validation
  if (!roomCategory || !roomTitle || !checkIn || !checkOut) {
    return res.status(400).json({
      isAvailable: false,
      message: 'Missing required parameters'
    });
  }

  // Parse dates
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  // Validate dates
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return res.status(400).json({
      isAvailable: false,
      message: 'Invalid date format'
    });
  }
  
  if (checkInDate >= checkOutDate) {
    return res.status(400).json({
      isAvailable: false,
      message: 'Check-out date must be after check-in date'
    });
  }

  // Check if there are any overlapping bookings
  const overlappingBookings = await Booking.find({
    roomTitle,
    roomCategory,
    status: { $nin: ['cancelled'] },
    $or: [
      // Case 1: New check-in is during an existing booking
      {
        checkIn: { $lte: checkIn },
        checkOut: { $gt: checkIn }
      },
      // Case 2: New check-out is during an existing booking
      {
        checkIn: { $lt: checkOut },
        checkOut: { $gte: checkOut }
      },
      // Case 3: New booking completely contains an existing booking
      {
        checkIn: { $gte: checkIn },
        checkOut: { $lte: checkOut }
      }
    ]
  });

  // If there are no overlapping bookings, room is available
  if (overlappingBookings.length === 0) {
    return res.status(200).json({
      isAvailable: true,
      message: 'Room is available for the selected dates!',
    });
  }

  // If room isn't available, suggest some alternative dates
  // This is a simple implementation - in a real application, you would
  // query for actual available dates in the database
  
  // Generate some sample alternative dates
  const today = new Date();
  const altDates = [];
  
  // Suggest dates 1, 2, and 3 weeks from now
  for (let i = 1; i <= 3; i++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + (i * 7));
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 2); // 2-day stay
    
    const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    altDates.push(dateRange);
  }
  
  return res.status(200).json({
    isAvailable: false,
    message: 'The room is not available for the selected dates.',
    availableDates: altDates
  });
});

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  getBookingHistory,
  getUserBookingHistory,
  checkAvailability,
}; 