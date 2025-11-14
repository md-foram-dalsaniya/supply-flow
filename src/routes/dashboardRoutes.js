const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDashboard,
  getAnalytics,
} = require('../controllers/dashboardController');

// All dashboard routes are protected
router.use(protect);

// @route   GET /api/dashboard
// @desc    Get dashboard data
// @access  Private
router.get('/', getDashboard);

// @route   GET /api/dashboard/analytics
// @desc    Get analytics data
// @access  Private
router.get('/analytics', getAnalytics);

module.exports = router;

