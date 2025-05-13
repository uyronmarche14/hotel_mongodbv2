const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// Room routes
// GET all rooms
router.get('/rooms', hotelController.getAllRooms);

// GET top rated rooms
router.get('/rooms/top-rated', hotelController.getTopRatedRooms);

// GET one room from each category
router.get('/rooms/categories/samples', hotelController.getCategorySamples);

// GET search rooms
router.get('/rooms/search', hotelController.searchRooms);

// GET rooms by category
router.get('/rooms/category/:category', hotelController.getRoomsByCategory);

// POST create a new room
router.post('/rooms', hotelController.createRoom);

// GET check room availability
router.get('/rooms/:id/availability', hotelController.checkRoomAvailability);

// GET a single room
router.get('/rooms/:id', hotelController.getRoomById);

// PUT update a room
router.put('/rooms/:id', hotelController.updateRoom);

// DELETE a room
router.delete('/rooms/:id', hotelController.deleteRoom);

// Hotel routes
// GET all hotels
router.get('/', hotelController.getAllHotels);

// GET a single hotel
router.get('/:id', hotelController.getHotelById);

// POST create a new hotel
router.post('/', hotelController.createHotel);

// PUT update a hotel
router.put('/:id', hotelController.updateHotel);

// DELETE a hotel
router.delete('/:id', hotelController.deleteHotel);

module.exports = router; 