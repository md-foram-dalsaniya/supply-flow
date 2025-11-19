const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDashboard,
  getAnalytics,
  getKPIs,
  getSalesOverview,
  getTopProducts,
  getCustomerDemographics,
} = require('../controllers/dashboardController');

router.use(protect);

router.get('/', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/kpis', getKPIs);
router.get('/sales-overview', getSalesOverview);
router.get('/top-products', getTopProducts);
router.get('/customer-demographics', getCustomerDemographics);

module.exports = router;

