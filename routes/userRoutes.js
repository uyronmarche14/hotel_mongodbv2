const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Protect all user routes with authentication
router.use(protect);

// GET all users
router.get('/', getAllUsers);

// GET user by ID
router.get('/:id', getUserById);

// UPDATE user
router.put('/:id', updateUser);

// DELETE user
router.delete('/:id', deleteUser);

module.exports = router; 