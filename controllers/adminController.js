// Hard-coded admin credentials (in a real app, use environment variables and proper hashing)
const ADMIN_USERNAME = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_TOKEN = 'admin-token-secure-123456';

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  // Check admin credentials
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      message: 'Admin login successful',
      token: ADMIN_TOKEN,
      admin: {
        username: ADMIN_USERNAME,
        role: 'admin'
      }
    });
  }

  return res.status(401).json({ message: 'Invalid admin credentials' });
};

// @desc    Verify admin token
// @route   GET /api/admin/verify
// @access  Admin
const verifyAdmin = (req, res) => {
  // adminAuth middleware has already verified the token if execution reaches here
  res.json({
    success: true,
    message: 'Admin token is valid',
    admin: {
      username: ADMIN_USERNAME,
      role: 'admin'
    }
  });
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getAdminStats = async (req, res) => {
  try {
    // In a real application, fetch actual statistics from the database
    // For now, we'll return mock statistics
    const stats = {
      users: {
        total: 124,
        activeThisMonth: 78,
        newThisWeek: 12
      },
      bookings: {
        total: 356,
        pending: 24,
        completed: 312,
        canceled: 20
      },
      rooms: {
        total: 85,
        occupied: 42,
        available: 43,
        maintenance: 3
      },
      revenue: {
        thisMonth: 287560,
        lastMonth: 245890,
        growth: 17
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    });
  }
};

module.exports = {
  adminLogin,
  verifyAdmin,
  getAdminStats
};
 