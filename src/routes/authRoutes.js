const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  requestOTP,
  login,
  logout,
  changeEmailDuringVerification,
  createTestUsers,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

router.post('/register', upload.single('image'), handleMulterError, register);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/change-email', changeEmailDuringVerification);
router.post('/create-test-users', createTestUsers);
router.post('/logout', protect, logout);

module.exports = router;

