const Campaign = require('../models/Campaign');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Private
exports.getCampaigns = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        // Build query
        const query = { supplier: req.user.id };

        // Filter by status
        if (status && status !== 'All') {
            query.status = status;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const campaigns = await Campaign.find(query)
            .populate('products', 'name image price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Campaign.countDocuments(query);

        // Get summary stats
        const activeCampaigns = await Campaign.countDocuments({
            supplier: req.user.id,
            status: 'Active',
        });

        const totalBudgetSpent = await Campaign.aggregate([
            { $match: { supplier: req.user.id } },
            { $group: { _id: null, total: { $sum: '$totalBudgetSpent' } } },
        ]);

        res.status(200).json({
            success: true,
            count: campaigns.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            summary: {
                activeCampaigns,
                totalBudgetSpent: totalBudgetSpent[0]?.total || 0,
            },
            campaigns,
        });
    } catch (error) {
        console.error('❌ Get campaigns error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while fetching campaigns',
        });
    }
};

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
// @access  Private
exports.getCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        }).populate('products', 'name image price category');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found',
            });
        }

        res.status(200).json({
            success: true,
            campaign,
        });
    } catch (error) {
        console.error('❌ Get campaign error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while fetching campaign',
        });
    }
};

// @desc    Create new campaign
// @route   POST /api/campaigns
// @access  Private
exports.createCampaign = async (req, res) => {
    try {
        const { name, products, dailyBudget, startDate, endDate } = req.body;

        // Validation
        if (!name || !products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide campaign name and at least one product',
            });
        }

        if (!dailyBudget || dailyBudget <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid daily budget',
            });
        }

        // Verify products belong to supplier
        const productIds = products.map((p) => p.productId || p);
        const validProducts = await Product.find({
            _id: { $in: productIds },
            supplier: req.user.id,
            isActive: true,
        });

        if (validProducts.length !== productIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Some products are invalid or do not belong to you',
            });
        }

        // Create campaign
        const campaign = await Campaign.create({
            name,
            supplier: req.user.id,
            products: productIds,
            dailyBudget: parseFloat(dailyBudget),
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : null,
            status: 'Active',
        });

        const populatedCampaign = await Campaign.findById(campaign._id)
            .populate('products', 'name image price');

        res.status(201).json({
            success: true,
            message: 'Campaign created successfully',
            campaign: populatedCampaign,
        });
    } catch (error) {
        console.error('❌ Create campaign error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while creating campaign',
        });
    }
};

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private
exports.updateCampaign = async (req, res) => {
    try {
        const { name, products, dailyBudget, status, startDate, endDate } = req.body;

        // Find campaign
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found',
            });
        }

        // Update fields
        if (name) campaign.name = name;
        if (dailyBudget !== undefined) campaign.dailyBudget = parseFloat(dailyBudget);
        if (status) campaign.status = status;
        if (startDate) campaign.startDate = new Date(startDate);
        if (endDate !== undefined) campaign.endDate = endDate ? new Date(endDate) : null;

        // Update products if provided
        if (products && Array.isArray(products)) {
            const productIds = products.map((p) => p.productId || p);
            const validProducts = await Product.find({
                _id: { $in: productIds },
                supplier: req.user.id,
                isActive: true,
            });

            if (validProducts.length !== productIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Some products are invalid or do not belong to you',
                });
            }

            campaign.products = productIds;
        }

        await campaign.save();

        const populatedCampaign = await Campaign.findById(campaign._id)
            .populate('products', 'name image price');

        res.status(200).json({
            success: true,
            message: 'Campaign updated successfully',
            campaign: populatedCampaign,
        });
    } catch (error) {
        console.error('❌ Update campaign error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while updating campaign',
        });
    }
};

// @desc    Get campaign stats
// @route   GET /api/campaigns/:id/stats
// @access  Private
exports.getCampaignStats = async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        }).populate('products', 'name image price category soldQuantity');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found',
            });
        }

        const ctr = campaign.impressions > 0
            ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
            : 0;

        const cpc = campaign.clicks > 0
            ? (campaign.totalBudgetSpent / campaign.clicks).toFixed(2)
            : 0;

        res.status(200).json({
            success: true,
            stats: {
                dailyBudget: campaign.dailyBudget,
                totalBudgetSpent: campaign.totalBudgetSpent,
                impressions: campaign.impressions,
                clicks: campaign.clicks,
                ctr: parseFloat(ctr),
                cpc: parseFloat(cpc),
                status: campaign.status,
            },
        });
    } catch (error) {
        console.error('❌ Get campaign stats error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while fetching campaign stats',
        });
    }
};

// @desc    Get campaign insights (detailed)
// @route   GET /api/campaigns/:id/insights
// @access  Private
exports.getCampaignInsights = async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        }).populate('products', 'name image price category soldQuantity');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found',
            });
        }

        // Calculate metrics
        const ctr = campaign.impressions > 0
            ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
            : 0;

        const cpc = campaign.clicks > 0
            ? (campaign.totalBudgetSpent / campaign.clicks).toFixed(2)
            : 0;

        // Get daily performance (last 7 days)
        const now = new Date();
        const dailyPerformance = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            // For demo purposes, we'll generate sample data
            // In production, you'd track daily metrics separately
            const dayImpressions = Math.floor(Math.random() * 200) + 300;
            const dayClicks = Math.floor(dayImpressions * (parseFloat(ctr) / 100));

            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            dailyPerformance.push({
                label: dayNames[date.getDay()],
                date: date.toISOString().split('T')[0],
                impressions: dayImpressions,
                clicks: dayClicks,
            });
        }

        // Product performance
        const productPerformance = campaign.products.map((product) => {
            // Calculate sales increase (mock data for demo)
            const salesIncrease = Math.floor(Math.random() * 30) + 10;
            const productImpressions = Math.floor(campaign.impressions / campaign.products.length);
            const productClicks = Math.floor(campaign.clicks / campaign.products.length);
            const productCtr = productImpressions > 0
                ? ((productClicks / productImpressions) * 100).toFixed(2)
                : 0;

            return {
                product: {
                    id: product._id,
                    name: product.name,
                    image: product.image,
                    category: product.category,
                    price: product.price,
                },
                salesIncrease: `+${salesIncrease}%`,
                impressions: productImpressions,
                clicks: productClicks,
                ctr: parseFloat(productCtr),
            };
        });

        // Generate recommendations
        const recommendations = [];
        if (parseFloat(ctr) > 5) {
            recommendations.push({
                type: 'increase_budget',
                icon: 'dollar',
                message: `Your campaign has a high CTR (${ctr}%). Consider increasing your daily budget to reach more customers.`,
            });
        }
        if (campaign.products.length < 5) {
            recommendations.push({
                type: 'add_products',
                icon: 'cart',
                message: 'You could increase visibility by adding complementary products to this campaign.',
            });
        }
        if (campaign.endDate && new Date(campaign.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
            recommendations.push({
                type: 'extend_campaign',
                icon: 'clock',
                message: 'This campaign is performing well. Consider extending it for continued sales growth.',
            });
        }

        res.status(200).json({
            success: true,
            campaign: {
                id: campaign._id,
                name: campaign.name,
                status: campaign.status,
                startDate: campaign.startDate,
                endDate: campaign.endDate,
                dailyBudget: campaign.dailyBudget,
                products: campaign.products,
            },
            overallPerformance: {
                impressions: campaign.impressions,
                clicks: campaign.clicks,
                ctr: parseFloat(ctr),
                cpc: parseFloat(cpc),
                totalSpend: campaign.totalBudgetSpent,
            },
            dailyPerformance,
            productPerformance,
            recommendations,
        });
    } catch (error) {
        console.error('❌ Get campaign insights error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while fetching campaign insights',
        });
    }
};

// @desc    Update campaign metrics (impressions, clicks)
// @route   PUT /api/campaigns/:id/metrics
// @access  Private
exports.updateCampaignMetrics = async (req, res) => {
    try {
        const { impressions, clicks } = req.body;

        const campaign = await Campaign.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found',
            });
        }

        if (impressions !== undefined) {
            campaign.impressions += parseInt(impressions);
        }

        if (clicks !== undefined) {
            campaign.clicks += parseInt(clicks);
            // Calculate cost (assuming $0.25 per click for example)
            const costPerClick = 0.25;
            campaign.totalBudgetSpent += parseFloat(clicks) * costPerClick;
        }

        await campaign.save();

        res.status(200).json({
            success: true,
            message: 'Campaign metrics updated successfully',
            campaign,
        });
    } catch (error) {
        console.error('❌ Update campaign metrics error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while updating campaign metrics',
        });
    }
};

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private
exports.deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found',
            });
        }

        await Campaign.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Campaign deleted successfully',
        });
    } catch (error) {
        console.error('❌ Delete campaign error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while deleting campaign',
        });
    }
};

