const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Room = require('../models/roomModel');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Get total bookings count
    const totalBookings = await Booking.countDocuments();
    
    // Get active bookings (not cancelled and checkout date in future)
    const activeBookings = await Booking.countDocuments({
      status: { $ne: 'cancelled' },
      checkOut: { $gt: new Date() }
    });
    
    // Get available rooms count (rooms not booked for current date)
    const totalRooms = await Room.countDocuments();
    
    // Get stats for bookings in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentBookings = await Booking.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Calculate revenue from all completed bookings
    const revenue = await Booking.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBookings,
        activeBookings,
        totalRooms,
        recentBookings,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin dashboard stats',
      error: error.message
    });
  }
};

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Admin get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort('-createdAt')
      .populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Admin get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// @desc    Get all rooms for admin
// @route   GET /api/admin/rooms
// @access  Private/Admin
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort('roomNumber');
    
    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    console.error('Admin get all rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    });
  }
};

// @desc    Create a new room
// @route   POST /api/admin/rooms
// @access  Private/Admin
exports.createRoom = async (req, res) => {
  try {
    const newRoom = await Room.create(req.body);
    
    res.status(201).json({
      success: true,
      data: newRoom
    });
  } catch (error) {
    console.error('Admin create room error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
};

// @desc    Update a room
// @route   PUT /api/admin/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Admin update room error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message
    });
  }
};

// @desc    Delete a room
// @route   DELETE /api/admin/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Check if room has any active bookings
    const hasBookings = await Booking.findOne({
      roomId: room._id,
      status: { $ne: 'cancelled' },
      checkOut: { $gt: new Date() }
    });
    
    if (hasBookings) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with active bookings'
      });
    }
    
    await room.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Room removed'
    });
  } catch (error) {
    console.error('Admin delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message
    });
  }
}; 