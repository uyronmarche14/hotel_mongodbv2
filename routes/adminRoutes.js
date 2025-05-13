const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes are protected by both auth and admin middleware
router.use(protect);
router.use(admin);

// Dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

// User management routes
router.get('/users', adminController.getAllUsers);

// Booking management routes
router.get('/bookings', adminController.getAllBookings);

// Room management routes
router.get('/rooms', adminController.getAllRooms);
router.post('/rooms', adminController.createRoom);
router.put('/rooms/:id', adminController.updateRoom);
router.delete('/rooms/:id', adminController.deleteRoom);

module.exports = router; 