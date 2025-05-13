const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { adminLogin, verifyAdmin, getAdminStats } = require('../controllers/adminController');
const userController = require('../controllers/userController');
const hotelController = require('../controllers/hotelController');

// Admin auth routes
router.post('/login', adminLogin);
router.get('/verify', adminAuth, verifyAdmin);
router.get('/stats', adminAuth, getAdminStats);

// User management routes
router.get('/users', adminAuth, userController.getAllUsers);
router.get('/users/:id', adminAuth, userController.getUserById);
router.put('/users/:id', adminAuth, userController.updateUser);
router.delete('/users/:id', adminAuth, userController.deleteUser);

// Hotel room management routes
router.get('/rooms', adminAuth, hotelController.getAllRooms);
router.post('/rooms', adminAuth, hotelController.createRoom);
router.get('/rooms/:id', adminAuth, hotelController.getRoomById);
router.put('/rooms/:id', adminAuth, hotelController.updateRoom);
router.delete('/rooms/:id', adminAuth, hotelController.deleteRoom);

module.exports = router; 
 