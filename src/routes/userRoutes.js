const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getMe,
  uploadProfileImage,
  updateProfile,
  getProfileInfo,
} = require('../controllers/userController');

// All user routes are protected
router.use(protect);

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', getMe);

// @route   POST /api/users/upload-profile-image
// @desc    Upload profile image
// @access  Private
router.post('/upload-profile-image', upload.single('image'), uploadProfileImage);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateProfile);

// @route   GET /api/users/profile-info
// @desc    Get detailed profile information
// @access  Private
router.get('/profile-info', getProfileInfo);

module.exports = router;

