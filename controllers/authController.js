const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  // Use a hardcoded secret instead of env variable
  const DEFAULT_SECRET = 'hotel_system_default_secret_2023';
  return jwt.sign({ id }, DEFAULT_SECRET, {
    expiresIn: '30d',
  });
};

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
        message: 'User already exists' 
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      const token = generateToken(user._id);
      
      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePic: user.profilePic,
          role: user.role,
        },
        token,
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
        message: 'Invalid credentials' 
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role,
      },
      token,
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