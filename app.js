const express = require('express');
const cors = require('cors');
const hotelRoutes = require('./routes/hotelRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:8000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Admin-Authorization', 'Accept', 'X-Requested-With'],
  credentials: true,
  exposedHeaders: ['Authorization', 'Admin-Authorization'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Admin credentials constants
const ADMIN_USERNAME = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_TOKEN = 'admin-token-secure-123456';

// Direct admin login response for testing without DB
app.post('/api/admin/direct-login', (req, res) => {
  const { username, password } = req.body;
  
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
});

// Verify admin token without DB
app.get('/api/admin/direct-verify', (req, res) => {
  const token = req.header('Admin-Authorization');
  
  if (token === ADMIN_TOKEN) {
    return res.json({
      success: true,
      message: 'Admin token is valid',
      admin: {
        username: ADMIN_USERNAME,
        role: 'admin'
      }
    });
  }
  
  return res.status(401).json({ message: 'Admin token is not valid' });
});

// Routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API server is up and running' });
});

// Debug route to show request info
app.get('/debug', (req, res) => {
  res.status(200).json({
    headers: req.headers,
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    body: req.body,
    message: 'Debug information'
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
