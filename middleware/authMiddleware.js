const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Use environment variable for JWT secret with fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'hotel_system_default_secret_2023';

// Log warning if using default secret
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: Using default JWT secret. This is insecure and should only be used in development.');
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL SECURITY WARNING: Using default JWT secret in PRODUCTION environment!');
  }
}

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
      const decoded = jwt.verify(token, JWT_SECRET);
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
      console.error('Auth middleware error:', error.name, error.message);
      
      // Detailed error handling for different types of JWT errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format or signature',
          code: 'INVALID_TOKEN'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Your session has expired, please log in again',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (error.name === 'NotBeforeError') {
        return res.status(401).json({
          success: false,
          message: 'Token not yet valid',
          code: 'TOKEN_NOT_ACTIVE'
        });
      }
      
      // Generic authorization failure
      res.status(401).json({
        success: false,
        message: 'Authentication failed',
        code: 'AUTH_FAILED'
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