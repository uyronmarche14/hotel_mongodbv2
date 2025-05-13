const express = require('express');
const cors = require('cors');
const hotelRoutes = require('./routes/hotelRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const fs = require('fs');

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:8000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  credentials: true,
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Special route for images - with explicit file handling
app.get('/uploads/profile/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'public/uploads/profile', req.params.filename);
  console.log('Image request for:', filePath);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    console.log('File exists, sending...');
    return res.sendFile(filePath);
  } else {
    console.log('File not found');
    return res.status(404).send('Image not found');
  }
});

// Serve static files from public directory
app.use('/static', express.static(path.join(__dirname, 'public')));
// Log any static file requests for debugging
app.use('/uploads', (req, res, next) => {
  console.log(`Static file request: ${req.path}`);
  next();
});

// Routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
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
