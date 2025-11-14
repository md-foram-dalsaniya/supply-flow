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
} = require('../controllers/campaignController');

// All campaign routes are protected
router.use(protect);

// @route   GET /api/campaigns
// @desc    Get all campaigns
// @access  Private
router.get('/', getCampaigns);

// @route   GET /api/campaigns/:id
// @desc    Get single campaign
// @access  Private
router.get('/:id', getCampaign);

// @route   POST /api/campaigns
// @desc    Create new campaign
// @access  Private
router.post('/', createCampaign);

// @route   PUT /api/campaigns/:id
// @desc    Update campaign
// @access  Private
router.put('/:id', updateCampaign);

// @route   GET /api/campaigns/:id/stats
// @desc    Get campaign stats
// @access  Private
router.get('/:id/stats', getCampaignStats);

// @route   GET /api/campaigns/:id/insights
// @desc    Get campaign insights (detailed)
// @access  Private
router.get('/:id/insights', getCampaignInsights);

// @route   PUT /api/campaigns/:id/metrics
// @desc    Update campaign metrics
// @access  Private
router.put('/:id/metrics', updateCampaignMetrics);

// @route   DELETE /api/campaigns/:id
// @desc    Delete campaign
// @access  Private
router.delete('/:id', deleteCampaign);

module.exports = router;

