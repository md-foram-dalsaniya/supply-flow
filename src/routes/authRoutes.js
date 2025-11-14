const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  requestOTP,
  logout,
  changeEmailDuringVerification,
  createTestUsers,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/request-otp
// @desc    Request OTP for login
// @access  Public
router.post('/request-otp', requestOTP);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login
// @access  Public
router.post('/verify-otp', verifyOTP);

// @route   POST /api/auth/change-email
// @desc    Change email address during verification
// @access  Public
router.post('/change-email', changeEmailDuringVerification);

// @route   POST /api/auth/create-test-users
// @desc    Create test supplier accounts for testing
// @access  Public
router.post('/create-test-users', createTestUsers);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

module.exports = router;

