const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStoreSettings,
  updateStoreSettings,
  updateRating,
} = require('../controllers/storeController');

// All store routes are protected
router.use(protect);

// @route   GET /api/store/settings
// @desc    Get store settings
// @access  Private
router.get('/settings', getStoreSettings);

// @route   PUT /api/store/settings
// @desc    Update store settings
// @access  Private
router.put('/settings', updateStoreSettings);

// @route   POST /api/store/rating
// @desc    Update store rating
// @access  Private
router.post('/rating', updateRating);

module.exports = router;

