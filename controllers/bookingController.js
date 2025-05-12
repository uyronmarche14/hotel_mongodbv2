const { v4: uuidv4 } = require('uuid');

// In-memory storage for bookings (replace with MongoDB in production)
let bookings = [];

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      roomType,
      roomTitle,
      roomCategory,
      roomImage,
      checkIn,
      checkOut,
      nights,
      guests,
      specialRequests,
      basePrice,
      taxAndFees,
      totalPrice,
      location
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !roomTitle || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create booking object
    const newBooking = {
      _id: uuidv4(),
      firstName,
      lastName,
      email,
      phone,
      roomType,
      roomTitle,
      roomCategory,
      roomImage,
      checkIn,
      checkOut,
      nights,
      guests,
      specialRequests,
      basePrice,
      taxAndFees,
      totalPrice,
      location,
      status: 'confirmed',
      paymentStatus: 'paid',
      bookingId: `BK-${Math.floor(Math.random() * 10000)}`,
      user: req.user ? req.user._id : null,
      createdAt: new Date().toISOString()
    };

    // Save booking
    bookings.push(newBooking);
    
    // Log the booking
    console.log(`New booking created: ${newBooking.bookingId}`);

    res.status(201).json({
      success: true,
      data: newBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all bookings (optionally filtered by email)
exports.getBookings = async (req, res) => {
  try {
    const { email } = req.query;
    
    let result = [...bookings];
    
    // Filter by email if provided
    if (email) {
      result = result.filter(booking => booking.email === email);
    }
    
    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = bookings.find(b => b._id === id || b.bookingId === id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bookingIndex = bookings.findIndex(b => b._id === id || b.bookingId === id);
    
    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Update booking status
    bookings[bookingIndex].status = 'cancelled';
    bookings[bookingIndex].paymentStatus = 'refunded';
    
    res.status(200).json({
      success: true,
      data: bookings[bookingIndex]
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get booking history with analytics
exports.getBookingHistory = async (req, res) => {
  try {
    // Calculate stats
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = bookings.reduce((sum, booking) => {
      // Only count revenue from confirmed or completed bookings
      if (booking.status === 'confirmed' || booking.status === 'completed') {
        return sum + booking.totalPrice;
      }
      return sum;
    }, 0);
    
    // Group by room type
    const roomStats = [];
    const roomTypes = [...new Set(bookings.map(b => b.roomCategory))];
    
    for (const roomType of roomTypes) {
      const typeBookings = bookings.filter(b => b.roomCategory === roomType);
      const typeRevenue = typeBookings.reduce((sum, booking) => {
        if (booking.status === 'confirmed' || booking.status === 'completed') {
          return sum + booking.totalPrice;
        }
        return sum;
      }, 0);
      
      roomStats.push({
        roomType,
        roomTitle: typeBookings[0]?.roomTitle || 'Unknown',
        count: typeBookings.length,
        totalRevenue: typeRevenue,
        imageUrl: typeBookings[0]?.roomImage || '',
        bookings: typeBookings.map(b => ({
          id: b._id,
          bookingId: b.bookingId,
          status: b.status,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          guests: b.guests,
          nights: b.nights,
          totalPrice: b.totalPrice,
          createdAt: b.createdAt
        }))
      });
    }
    
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
    console.error('Error fetching booking history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get booking history for a specific user
exports.getUserBookingHistory = async (req, res) => {
  try {
    const { email } = req.params;
    
    // Filter bookings by email
    const userBookings = bookings.filter(b => b.email === email);
    
    // Calculate stats
    const totalBookings = userBookings.length;
    const completedBookings = userBookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = userBookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = userBookings.reduce((sum, booking) => {
      if (booking.status === 'confirmed' || booking.status === 'completed') {
        return sum + booking.totalPrice;
      }
      return sum;
    }, 0);
    
    // Group by room type
    const roomStats = [];
    const roomTypes = [...new Set(userBookings.map(b => b.roomCategory))];
    
    for (const roomType of roomTypes) {
      const typeBookings = userBookings.filter(b => b.roomCategory === roomType);
      const typeRevenue = typeBookings.reduce((sum, booking) => {
        if (booking.status === 'confirmed' || booking.status === 'completed') {
          return sum + booking.totalPrice;
        }
        return sum;
      }, 0);
      
      roomStats.push({
        roomType,
        roomTitle: typeBookings[0]?.roomTitle || 'Unknown',
        count: typeBookings.length,
        totalRevenue: typeRevenue,
        imageUrl: typeBookings[0]?.roomImage || '',
        bookings: typeBookings.map(b => ({
          id: b._id,
          bookingId: b.bookingId,
          status: b.status,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          guests: b.guests,
          nights: b.nights,
          totalPrice: b.totalPrice,
          createdAt: b.createdAt
        }))
      });
    }
    
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
    console.error('Error fetching user booking history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 