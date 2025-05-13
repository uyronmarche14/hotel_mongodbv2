const Hotel = require('../models/hotelModel');
const Room = require('../models/roomModel');

// Get all hotels
exports.getAllHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    next(error);
  }
};

// Get single hotel by ID
exports.getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    next(error);
  }
};

// Create a new hotel
exports.createHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.create(req.body);
    
    res.status(201).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    next(error);
  }
};

// Update a hotel
exports.updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    next(error);
  }
};

// Delete a hotel
exports.deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rooms
// @route   GET /api/hotels/rooms
// @access  Public
const getAllRooms = async (req, res) => {
  try {
    console.log('API Request received: GET /api/hotels/rooms');
    
    // Support pagination with query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // High default limit to get all rooms
    const skip = (page - 1) * limit;
    
    // Fetch rooms with pagination
    const rooms = await Room.find()
                           .skip(skip)
                           .limit(limit)
                           .sort({ createdAt: -1 }); // Sort by newest first
    
    // Get total count for pagination info
    const total = await Room.countDocuments();
    
    console.log(`Found ${rooms.length} rooms in the database (page ${page} of ${Math.ceil(total/limit)})`);
    console.log(`Total rooms in database: ${total}`);
    
    // Return success response with rooms data and pagination info
    res.status(200).json({
      success: true,
      count: rooms.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      data: rooms
    });
  } catch (error) {
    console.error('Error in getAllRooms:', error.message);
    console.error(error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rooms',
      error: error.message
    });
  }
};

// @desc    Create a new room
// @route   POST /api/hotels/rooms
// @access  Public
const createRoom = async (req, res) => {
  try {
    const {
      title,
      description,
      fullDescription,
      price,
      imageUrl,
      location,
      category,
      rating,
      maxOccupancy,
      bedType,
      roomSize,
      amenities,
      additionalAmenities
    } = req.body;
    
    // Validate required fields
    if (!title || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, price, and category for the room'
      });
    }
    
    // Create room object
    const newRoom = new Room({
      title,
      description,
      fullDescription,
      price,
      imageUrl,
      location,
      category,
      rating,
      maxOccupancy,
      bedType,
      roomSize,
      amenities,
      additionalAmenities
    });
    
    // Save to database
    const room = await newRoom.save();
    
    res.status(201).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating room'
    });
  }
};

// @desc    Get room by ID
// @route   GET /api/hotels/rooms/:id
// @access  Public
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Get room by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching room'
    });
  }
};

// @desc    Update room
// @route   PUT /api/hotels/rooms/:id
// @access  Public
const updateRoom = async (req, res) => {
  try {
    const {
      title,
      description,
      fullDescription,
      price,
      imageUrl,
      location,
      category,
      rating,
      maxOccupancy,
      bedType,
      roomSize,
      amenities,
      additionalAmenities,
      isAvailable
    } = req.body;
    
    // Build room update object
    const roomFields = {};
    if (title) roomFields.title = title;
    if (description) roomFields.description = description;
    if (fullDescription) roomFields.fullDescription = fullDescription;
    if (price) roomFields.price = price;
    if (imageUrl) roomFields.imageUrl = imageUrl;
    if (location) roomFields.location = location;
    if (category) roomFields.category = category;
    if (rating) roomFields.rating = rating;
    if (maxOccupancy) roomFields.maxOccupancy = maxOccupancy;
    if (bedType) roomFields.bedType = bedType;
    if (roomSize) roomFields.roomSize = roomSize;
    if (amenities) roomFields.amenities = amenities;
    if (additionalAmenities) roomFields.additionalAmenities = additionalAmenities;
    if (isAvailable !== undefined) roomFields.isAvailable = isAvailable;
    
    // Update room
    let room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: roomFields },
      { new: true }
    );
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Update room error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating room'
    });
  }
};

// @desc    Delete room
// @route   DELETE /api/hotels/rooms/:id
// @access  Public
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    await Room.findByIdAndRemove(req.params.id);
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting room'
    });
  }
};

// @desc    Get top rated rooms
// @route   GET /api/hotels/rooms/top-rated
// @access  Public
const getTopRatedRooms = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const rooms = await Room.find({ rating: { $exists: true } })
      .sort({ rating: -1 })
      .limit(limit);
    
    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    console.error('Get top rated rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching top rated rooms'
    });
  }
};

// @desc    Get rooms by category
// @route   GET /api/hotels/rooms/category/:category
// @access  Public
const getRoomsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const rooms = await Room.find({ category });
    
    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    console.error('Get rooms by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rooms by category'
    });
  }
};

// @desc    Get one room from each category
// @route   GET /api/hotels/rooms/categories/samples
// @access  Public
const getCategorySamples = async (req, res) => {
  try {
    // Get all unique categories
    const categories = await Room.distinct('category');
    
    // For each category, get the top rated room
    const categoryRooms = await Promise.all(
      categories.map(async (category) => {
        return Room.findOne({ category })
          .sort({ rating: -1 });
      })
    );
    
    // Filter out any nulls
    const filteredRooms = categoryRooms.filter(room => room !== null);
    
    res.json({
      success: true,
      count: filteredRooms.length,
      data: filteredRooms
    });
  } catch (error) {
    console.error('Get category samples error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category samples'
    });
  }
};

// @desc    Search rooms
// @route   GET /api/hotels/rooms/search
// @access  Public
const searchRooms = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }
    
    // Create text search query
    const rooms = await Room.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { bedType: { $regex: q, $options: 'i' } }
      ]
    });
    
    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    console.error('Search rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching rooms'
    });
  }
};

// @desc    Check room availability
// @route   GET /api/hotels/rooms/:id/availability
// @access  Public
const checkRoomAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide checkIn and checkOut dates'
      });
    }
    
    // First, check if room exists
    const room = await Room.findById(id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Check if room is available
    if (!room.isAvailable) {
      return res.json({
        success: true,
        available: false,
        message: 'Room is not available for booking'
      });
    }
    
    // TODO: Add logic to check bookings table for this room on the given dates
    // This is a placeholder that assumes the room is available if it exists and isAvailable=true
    
    res.json({
      success: true,
      available: true
    });
  } catch (error) {
    console.error('Check room availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking room availability'
    });
  }
};

// Export room controller methods
exports.getAllRooms = getAllRooms;
exports.createRoom = createRoom;
exports.getRoomById = getRoomById;
exports.updateRoom = updateRoom;
exports.deleteRoom = deleteRoom;
exports.getTopRatedRooms = getTopRatedRooms;
exports.getRoomsByCategory = getRoomsByCategory;
exports.getCategorySamples = getCategorySamples;
exports.searchRooms = searchRooms;
exports.checkRoomAvailability = checkRoomAvailability;

module.exports = {
  getAllHotels: exports.getAllHotels,
  getHotelById: exports.getHotelById,
  createHotel: exports.createHotel,
  updateHotel: exports.updateHotel,
  deleteHotel: exports.deleteHotel,
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getTopRatedRooms,
  getRoomsByCategory,
  getCategorySamples,
  searchRooms,
  checkRoomAvailability
};