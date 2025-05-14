const User = require('../models/userModel');
const RefreshToken = require('../models/refreshTokenModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Access Token - shorter lived
const generateAccessToken = (id) => {
  // Use environment variable for JWT secret with fallback for development
  const JWT_SECRET = process.env.JWT_SECRET || 'hotel_system_default_secret_2023';
  
  // Log warning if using default secret in production
  if (!process.env.JWT_SECRET) {
    console.warn('WARNING: Using default JWT secret. This is insecure and should only be used in development.');
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL SECURITY WARNING: Using default JWT secret in PRODUCTION environment!');
    }
  }
  
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h', // Short-lived token (1 hour default)
  });
};

// Generate Refresh Token - longer lived
const generateRefreshToken = async (userId, ipAddress, userAgent) => {
  try {
    // Generate a secure random token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // Calculate expiry time (default 30 days)
    const expiryDays = parseInt(process.env.REFRESH_TOKEN_EXPIRY || '30', 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    
    // Create the refresh token in database
    const tokenDoc = await RefreshToken.create({
      user: userId,
      token: refreshToken,
      expiresAt,
      ipAddress,
      userAgent
    });
    
    return tokenDoc.token;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw error;
  }
};

// Admin credentials from environment variables with fallbacks for development
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

// Log warning if using default admin credentials
if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  console.warn('WARNING: Using default admin credentials. This is insecure and should only be used in development.');
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL SECURITY WARNING: Using default admin credentials in PRODUCTION environment!');
  }
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Get client info for security logging
      const userAgent = req.headers['user-agent'] || 'unknown';
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = await generateRefreshToken(user._id, ipAddress, userAgent);
      
      // Set HTTP-only cookie with refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,  // Prevents JavaScript access
        secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
        sameSite: 'strict',  // CSRF protection
        maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days in milliseconds
        path: '/api/auth/refresh-token'  // Only sent to the refresh token endpoint
      });
      
      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePic: user.profilePic,
          role: user.role,
        },
        token: accessToken,
        // Don't include refreshToken in the response body for security
      });
    } else {
      res.status(400).json({ 
        success: false,
        message: 'Invalid user data' 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Get client info for security logging
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id, ipAddress, userAgent);
    
    // Set HTTP-only cookie with refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,  // Prevents JavaScript access
      secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
      sameSite: 'strict',  // CSRF protection
      maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days in milliseconds
      path: '/api/auth/refresh-token'  // Only sent to the refresh token endpoint
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role,
      },
      token: accessToken,
      // Don't include refreshToken in the response body for security
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    console.log('====== GET USER PROFILE ======');
    
    // Check if req.user exists
    if (!req.user || !req.user.id) {
      console.error('User not found in request object');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or not found'
      });
    }
    
    console.log('User ID:', req.user.id);
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.error('User not found in database');
      return res.status(404).json({
        success: false,
        message: 'User not found in database'
      });
    }

    console.log('User data retrieved successfully');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        createdAt: user.createdAt
      },
    });
  } catch (error) {
    console.error('====== GET USER PROFILE ERROR ======');
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    console.log('====== UPDATE USER PROFILE ======');
    
    // Check if req.user exists
    if (!req.user || !req.user.id) {
      console.error('User not found in request object');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or not found'
      });
    }
    
    console.log('User ID:', req.user.id);
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    
    // Fields to update
    const {
      name,
      email,
      phone,
      address,
      bio
    } = req.body;
    
    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (phone) userFields.phone = phone;
    if (address) userFields.address = address;
    if (bio) userFields.bio = bio;
    
    // Handle profile picture upload if included
    if (req.file) {
      const filename = req.file.filename;
      // Keep URL structure as /uploads/profile/filename to work with our explicit route
      const uploadUrl = `/uploads/profile/${filename}`;
      console.log('Profile picture filename:', filename);
      console.log('Profile picture URL:', uploadUrl);
      userFields.profilePic = uploadUrl;
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    );
    
    if (!user) {
      console.error('User not found in database');
      return res.status(404).json({
        success: false,
        message: 'User not found in database'
      });
    }

    console.log('User profile updated successfully');

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role,
        phone: user.phone,
        address: user.address,
        bio: user.bio
      },
    });
  } catch (error) {
    console.error('====== UPDATE USER PROFILE ERROR ======');
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Admin login with credentials from environment variables
// @route   POST /api/auth/admin-login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Warning about admin credentials if they're using defaults
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      console.warn('Admin login using default credentials');
    }

    // Check if credentials match values from environment variables
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid admin credentials' 
      });
    }

    // Find or create admin user
    let adminUser = await User.findOne({ email: 'admin@hotel.com' });
    
    if (!adminUser) {
      // Create admin user if it doesn't exist
      adminUser = await User.create({
        name: 'Hotel Admin',
        email: 'admin@hotel.com',
        password: ADMIN_CREDENTIALS.password,
        role: 'admin'
      });
    }

    // Generate token for admin
    const token = generateToken(adminUser._id);

    res.status(200).json({
      success: true,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
      token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh-token
// @access  Public (but requires valid refresh token in cookie)
exports.refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token not found',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }
    
    // Find the refresh token in the database
    const foundToken = await RefreshToken.findOne({ 
      token: refreshToken,
      isRevoked: false
    });
    
    if (!foundToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
    
    // Check if token is expired
    if (foundToken.expiresAt < new Date()) {
      await RefreshToken.findByIdAndUpdate(foundToken._id, { isRevoked: true });
      
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }
    
    // Get the user associated with the token
    const user = await User.findById(foundToken.user);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Generate a new access token
    const accessToken = generateAccessToken(user._id);
    
    // Return the new access token
    res.status(200).json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
}; 