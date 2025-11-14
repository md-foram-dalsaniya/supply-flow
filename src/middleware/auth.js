/**
 * AUTH.JS - Authentication Middleware
 * 
 * This file protects routes that require login.
 * It checks if the user has a valid token (like a key card).
 * If token is valid, user can access the route.
 * If token is invalid or missing, user gets an error.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Verify JWT token
// This function runs before protected routes to check if user is logged in
exports.protect = async (req, res, next) => {
  let token;

  // Step 1: Get token from request headers
  // Token comes in format: "Bearer abc123xyz..."
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Extract just the token part
  }

  // Step 2: Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Please login to access this route. No token provided.',
    });
  }

  try {
    // Step 3: Verify token is valid (not expired, not tampered with)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: Find user in database using ID from token
    req.user = await User.findById(decoded.id).select('-password -otp -otpExpireTime');

    // Step 5: Check if user still exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.',
      });
    }

    // Step 6: If everything is OK, allow request to continue
    console.log(`✅ Authenticated user: ${req.user.email}`);
    next();
  } catch (error) {
    // Token is invalid or expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.',
    });
  }
};

