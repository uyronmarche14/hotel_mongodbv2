const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Use a hardcoded secret instead of env variable
const DEFAULT_SECRET = 'hotel_system_default_secret_2023';

exports.protect = async (req, res, next) => {
  let token;

  console.log('====== AUTH MIDDLEWARE ======');
  console.log('Headers:', req.headers.authorization ? 'Authorization header present' : 'No authorization header');

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token ? 'Valid token format' : 'Empty token');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, empty token',
        });
      }

      // Verify token
      const decoded = jwt.verify(token, DEFAULT_SECRET);
      console.log('Token decoded successfully, user ID:', decoded.id);

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        console.error('User from token not found in database');
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      console.log('User authenticated:', user.name);
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
        });
      }
      
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } else {
    console.error('No authorization header found');
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }
};

// Admin middleware
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as an admin',
    });
  }
}; 