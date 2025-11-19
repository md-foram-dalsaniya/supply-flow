const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    getCampaignStats,
    getCampaignInsights,
    updateCampaignMetrics,
    deleteCampaign,
    getTopRankingProducts,
    boostRanking,
} = require('../controllers/campaignController');

router.use(protect);

router.get('/top-ranking', getTopRankingProducts);
router.post('/boost-ranking', boostRanking);
router.get('/:id/stats', getCampaignStats);
router.get('/:id/insights', getCampaignInsights);
router.get('/:id', getCampaign);
router.get('/', getCampaigns);
router.post('/', createCampaign);
router.put('/:id/metrics', updateCampaignMetrics);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

module.exports = router;

