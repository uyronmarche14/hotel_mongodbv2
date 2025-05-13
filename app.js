const express = require('express');
const cors = require('cors');
const hotelRoutes = require('./routes/hotelRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const errorHandler = require('./middleware/errorHandler');

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

// Routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

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
