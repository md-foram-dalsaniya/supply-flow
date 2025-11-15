const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStoreSettings,
  updateStoreSettings,
  updateRating,
} = require('../controllers/storeController');

router.use(protect);

router.get('/settings', getStoreSettings);
router.put('/settings', updateStoreSettings);
router.post('/rating', updateRating);

module.exports = router;

