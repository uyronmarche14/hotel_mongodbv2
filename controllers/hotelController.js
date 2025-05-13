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
    const rooms = await Room.find();
    
    res.json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    console.error('Get all rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rooms'
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

module.exports = {
  getAllHotels: exports.getAllHotels,
  getHotelById: exports.getHotelById,
  createHotel: exports.createHotel,
  updateHotel: exports.updateHotel,
  deleteHotel: exports.deleteHotel,
  getAllRooms,
  createRoom,
  getRoomById,
  updateRoom,
  deleteRoom
};