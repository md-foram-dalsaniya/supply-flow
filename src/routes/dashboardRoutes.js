const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDashboard,
  getAnalytics,
} = require('../controllers/dashboardController');

router.use(protect);

router.get('/analytics', getAnalytics);
router.get('/', getDashboard);

module.exports = router;

