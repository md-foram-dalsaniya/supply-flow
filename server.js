/**
 * SERVER.JS - Main Entry Point
 * 
 * This is the main file that starts our server.
 * It connects to the database, sets up routes, and handles errors.
 */

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/database');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app (this creates our web server)
const app = express();

// Middleware - These run on every request
app.use(cors()); // Allows frontend to talk to backend
app.use(express.json()); // Lets server understand JSON data
app.use(express.urlencoded({ extended: true })); // Lets server understand form data

console.log('🚀 Starting InstaSupply Backend Server...');
console.log('📦 Loading environment variables...');

// Connect to MongoDB database
console.log('🔌 Connecting to MongoDB...');
connectDB();

// Routes - These connect URLs to our functions
console.log('📋 Setting up API routes...');
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/store', require('./src/routes/storeRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/campaigns', require('./src/routes/campaignRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
console.log('✅ All routes loaded successfully');

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to InstaSupply Supplier Portal API',
    version: '1.0.0',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler middleware - Catches all errors and returns clean messages
app.use((err, req, res, next) => {
  // Log error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error occurred:', err.message);
  } else {
    console.error('❌ Error occurred:', err.message);
  }

  // Handle file upload errors (Multer)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB',
      });
    }
    if (err.message && err.message.includes('Boundary not found')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request format. Please use form-data in Postman (not raw JSON). In Postman: 1) Select Body tab, 2) Choose form-data, 3) Add your file with key name "image" or "images", 4) DO NOT manually set Content-Type header - Postman will add it automatically.',
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error. Please check your file and try again.',
    });
  }

  // Handle multipart boundary errors
  if (err.message && err.message.includes('Boundary not found')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request format. Please use form-data in Postman (not raw JSON). In Postman: 1) Select Body tab, 2) Choose form-data, 3) Add your file with key name "image" or "images", 4) DO NOT manually set Content-Type header - Postman will add it automatically.',
    });
  }

  // Handle validation errors (from MongoDB)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired. Please login again.',
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists. Please use a different ${field}.`,
    });
  }

  // Default error - Return clean message, not stack trace
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Something went wrong. Please try again later.',
  });
});

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ InstaSupply Backend Server is Running!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: MongoDB`);
  console.log(`📝 API Base: http://localhost:${PORT}/api`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});

module.exports = app;

