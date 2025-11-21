const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No Token Found. Please login to access this route.',
    });
  }

  try {
    // Verify token - this will automatically reject expired tokens
    // jwt.verify() throws TokenExpiredError if token is expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password -otp -otpExpireTime');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No Token Found. User not found with this token.',
      });
    }

    console.log(`✅ Authenticated user: ${req.user.email}`);
    next();
  } catch (error) {
    // Handle expired token error
    if (error.name === 'TokenExpiredError') {
      console.error('❌ Token expired:', error.expiredAt);
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }

    // Handle invalid token error
    if (error.name === 'JsonWebTokenError') {
      console.error('❌ Invalid token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'No Token Found. Invalid token. Please login again.',
      });
    }

    console.error('❌ Authentication error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'No Token Found. Authentication failed. Please login again.',
    });
  }
};
