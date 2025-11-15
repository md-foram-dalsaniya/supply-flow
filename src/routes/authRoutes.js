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

router.post('/register', register);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/change-email', changeEmailDuringVerification);
router.post('/create-test-users', createTestUsers);
router.post('/logout', protect, logout);

module.exports = router;

