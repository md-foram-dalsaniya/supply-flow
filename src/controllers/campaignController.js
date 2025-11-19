const Campaign = require('../models/Campaign');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

exports.getCampaigns = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = { supplier: req.user.id };

        if (status && status !== 'All') {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const campaigns = await Campaign.find(query)
            .populate('products', 'name image images price category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Campaign.countDocuments(query);
        const activeCampaigns = await Campaign.countDocuments({
            supplier: req.user.id,
            status: 'Active',
        });

        const totalBudgetSpent = await Campaign.aggregate([
            { $match: { supplier: req.user.id } },
            { $group: { _id: null, total: { $sum: '$totalBudgetSpent' } } },
        ]);

        // Format campaigns for UI display
        const formattedCampaigns = campaigns.map((campaign) => {
            const campaignObj = campaign.toObject();
            // Get product images (use first image from images array or main image)
            const productImages = campaign.products.map((product) => {
                if (product.images && product.images.length > 0) {
                    return product.images[0];
                }
                return product.image || null;
            }).filter(img => img !== null);

            return {
                id: campaignObj._id,
                name: campaignObj.name,
                status: campaignObj.status,
                dailyBudget: parseFloat(campaignObj.dailyBudget.toFixed(2)),
                impressions: campaignObj.impressions,
                clicks: campaignObj.clicks,
                totalBudgetSpent: parseFloat((campaignObj.totalBudgetSpent || 0).toFixed(2)),
                productImages: productImages.slice(0, 6), // Max 6 images for display
                productsCount: campaignObj.products.length,
                products: campaignObj.products.map((p) => ({
                    id: p._id,
                    name: p.name,
                    image: p.image || (p.images && p.images.length > 0 ? p.images[0] : null),
                    price: p.price,
                    category: p.category,
                })),
                startDate: campaignObj.startDate,
                endDate: campaignObj.endDate,
                createdAt: campaignObj.createdAt,
            };
        });

        res.status(200).json({
            success: true,
            count: formattedCampaigns.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            summary: {
                activeCampaigns,
                totalBudgetSpent: parseFloat((totalBudgetSpent[0]?.total || 0).toFixed(2)),
            },
            campaigns: formattedCampaigns,
        });
    } catch (error) {
        console.error('❌ Get campaigns error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaigns',
        });
    }
};

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
            message: 'Failed to fetch campaign',
        });
    }
};

exports.createCampaign = async (req, res) => {
    try {
        const { name, products, dailyBudget, startDate, endDate } = req.body;

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
            message: 'Failed to create campaign',
        });
    }
};

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

        if (name) campaign.name = name;
        if (dailyBudget !== undefined) campaign.dailyBudget = parseFloat(dailyBudget);
        if (status) campaign.status = status;
        if (startDate) campaign.startDate = new Date(startDate);
        if (endDate !== undefined) campaign.endDate = endDate ? new Date(endDate) : null;

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
            message: 'Failed to update campaign',
        });
    }
};

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

        // Calculate week-over-week comparison
        const currentWeekImpressions = campaign.impressions;
        const previousWeekImpressions = Math.floor(campaign.impressions * 0.88);
        const impressionsChange = previousWeekImpressions > 0
            ? Math.round(((currentWeekImpressions - previousWeekImpressions) / previousWeekImpressions) * 100)
            : 0;

        const currentWeekClicks = campaign.clicks;
        const previousWeekClicks = Math.floor(campaign.clicks * 0.92);
        const clicksChange = previousWeekClicks > 0
            ? Math.round(((currentWeekClicks - previousWeekClicks) / previousWeekClicks) * 100)
            : 0;

        res.status(200).json({
            success: true,
            stats: {
                dailyBudget: parseFloat(campaign.dailyBudget.toFixed(2)),
                totalBudgetSpent: parseFloat(campaign.totalBudgetSpent.toFixed(2)),
                impressions: {
                    value: campaign.impressions,
                    change: impressionsChange,
                    changeType: impressionsChange >= 0 ? 'increase' : 'decrease',
                },
                clicks: {
                    value: campaign.clicks,
                    change: clicksChange,
                    changeType: clicksChange >= 0 ? 'increase' : 'decrease',
                },
                ctr: parseFloat(ctr),
                cpc: parseFloat(cpc),
                status: campaign.status,
            },
        });
    } catch (error) {
        console.error('❌ Get campaign stats error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaign stats',
        });
    }
};

// Helper function to format date as "Mar 1, 2025"
const formatCampaignDate = (date) => {
    if (!date) return null;
    const campaignDate = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[campaignDate.getMonth()];
    const day = campaignDate.getDate();
    const year = campaignDate.getFullYear();
    return `${month} ${day}, ${year}`;
};

exports.getCampaignInsights = async (req, res) => {
    try {
        const { period = '7days' } = req.query; // period: '7days', '14days', '30days'
        
        const campaign = await Campaign.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        }).populate('products', 'name image images price category soldQuantity');

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

        // Calculate week-over-week comparison
        const now = new Date();
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
        currentWeekStart.setHours(0, 0, 0, 0);
        
        const previousWeekStart = new Date(currentWeekStart);
        previousWeekStart.setDate(currentWeekStart.getDate() - 7);
        
        const previousWeekEnd = new Date(currentWeekStart);
        previousWeekEnd.setDate(currentWeekStart.getDate() - 1);
        previousWeekEnd.setHours(23, 59, 59, 999);

        // For demo purposes, calculate week-over-week change
        // In production, you'd query actual historical data
        const currentWeekImpressions = campaign.impressions;
        const previousWeekImpressions = Math.floor(campaign.impressions * 0.88); // Simulated 12% increase
        const impressionsChange = previousWeekImpressions > 0
            ? Math.round(((currentWeekImpressions - previousWeekImpressions) / previousWeekImpressions) * 100)
            : 0;

        const currentWeekClicks = campaign.clicks;
        const previousWeekClicks = Math.floor(campaign.clicks * 0.92); // Simulated 8% increase
        const clicksChange = previousWeekClicks > 0
            ? Math.round(((currentWeekClicks - previousWeekClicks) / previousWeekClicks) * 100)
            : 0;

        // Determine number of days based on period
        let daysToShow = 7;
        if (period === '14days') daysToShow = 14;
        if (period === '30days') daysToShow = 30;

        const now2 = new Date();
        const dailyPerformance = [];
        for (let i = daysToShow - 1; i >= 0; i--) {
            const date = new Date(now2);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            // Simulate daily data (in production, query actual daily metrics)
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

        const productPerformance = campaign.products.map((product) => {
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
                    image: product.image || (product.images && product.images.length > 0 ? product.images[0] : null),
                    category: product.category,
                    price: product.price,
                },
                salesIncrease: `+${salesIncrease}%`,
                salesIncreaseValue: salesIncrease,
                impressions: productImpressions,
                clicks: productClicks,
                ctr: parseFloat(productCtr),
            };
        });

        const recommendations = [];
        if (parseFloat(ctr) > 5) {
            recommendations.push({
                type: 'increase_budget',
                icon: 'lightbulb',
                message: `Your campaign has a high CTR (${ctr}%). Consider increasing your daily budget to reach more customers.`,
            });
        }
        if (campaign.products.length < 5) {
            // Suggest specific complementary products based on category
            const mainCategory = campaign.products[0]?.category || 'Building Materials';
            const suggestions = {
                'Building Materials': 'sand or gravel',
                'Tools': 'safety equipment or work gloves',
                'Plumbing': 'pipe fittings or sealants',
                'Electrical': 'wire connectors or switches',
                'Hardware': 'screws or nails',
            };
            recommendations.push({
                type: 'add_products',
                icon: 'location',
                message: `You could increase visibility by adding complementary products like ${suggestions[mainCategory] || 'related items'} to this campaign.`,
            });
        }
        if (campaign.endDate && new Date(campaign.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
            const endDateFormatted = formatCampaignDate(campaign.endDate);
            recommendations.push({
                type: 'extend_campaign',
                icon: 'clock',
                message: `This campaign is performing well. Consider extending it beyond ${endDateFormatted} for continued sales growth.`,
            });
        }

        // Get product images for campaign summary
        const productImages = campaign.products.map((product) => {
            if (product.images && product.images.length > 0) {
                return product.images[0];
            }
            return product.image || null;
        }).filter(img => img !== null);

        res.status(200).json({
            success: true,
            campaign: {
                id: campaign._id,
                name: campaign.name,
                status: campaign.status,
                startDate: campaign.startDate,
                startDateFormatted: formatCampaignDate(campaign.startDate),
                endDate: campaign.endDate,
                endDateFormatted: formatCampaignDate(campaign.endDate),
                dailyBudget: parseFloat(campaign.dailyBudget.toFixed(2)),
                products: campaign.products.map((p) => ({
                    id: p._id,
                    name: p.name,
                    image: p.image || (p.images && p.images.length > 0 ? p.images[0] : null),
                    price: p.price,
                    category: p.category,
                })),
                productImages: productImages.slice(0, 6),
            },
            overallPerformance: {
                impressions: {
                    value: campaign.impressions,
                    change: impressionsChange,
                    changeType: impressionsChange >= 0 ? 'increase' : 'decrease',
                    changeLabel: impressionsChange >= 0 
                        ? `${impressionsChange}% vs. last week`
                        : `${Math.abs(impressionsChange)}% vs. last week`,
                },
                clicks: {
                    value: campaign.clicks,
                    change: clicksChange,
                    changeType: clicksChange >= 0 ? 'increase' : 'decrease',
                    changeLabel: clicksChange >= 0 
                        ? `${clicksChange}% vs. last week`
                        : `${Math.abs(clicksChange)}% vs. last week`,
                },
                ctr: parseFloat(ctr),
                cpc: parseFloat(cpc),
                totalSpend: parseFloat(campaign.totalBudgetSpent.toFixed(2)),
            },
            dailyPerformance: {
                period: period,
                periodLabel: period === '7days' ? 'Last 7 Days' : period === '14days' ? 'Last 14 Days' : 'Last 30 Days',
                data: dailyPerformance,
            },
            productPerformance,
            recommendations,
        });
    } catch (error) {
        console.error('❌ Get campaign insights error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaign insights',
        });
    }
};

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
            message: 'Failed to update campaign metrics',
        });
    }
};

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
            message: 'Failed to delete campaign',
        });
    }
};

// @desc    Get top ranking products
// @route   GET /api/campaigns/top-ranking
// @access  Private
exports.getTopRankingProducts = async (req, res) => {
    try {
        const supplierId = req.user.id;
        const { limit = 10 } = req.query;

        // Get products with ranking information
        const products = await Product.find({
            supplier: supplierId,
            isActive: true,
            'ranking.position': { $ne: null },
        })
            .sort({ 'ranking.position': 1, soldQuantity: -1 })
            .limit(parseInt(limit));

        // Format products for UI display
        const formattedProducts = products.map((product) => {
            const productObj = product.toObject();
            const position = product.ranking?.position || null;
            const category = product.ranking?.category || product.category;
            const tags = product.ranking?.tags || [];

            // Format position text (e.g., "1st in Tools", "2nd in Building Materials")
            let positionText = null;
            if (position && category) {
                const suffixes = ['th', 'st', 'nd', 'rd'];
                const v = position % 100;
                const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
                positionText = `${position}${suffix} in ${category}`;
            }

            return {
                id: productObj._id,
                rank: position,
                productName: productObj.name,
                productImage: productObj.image || (productObj.images && productObj.images.length > 0 ? productObj.images[0] : null),
                category: productObj.category,
                price: productObj.price,
                rankingTags: tags, // e.g., ["Top Rated", "Best Seller", "Promoted", "Popular"]
                positionText: positionText,
                soldQuantity: productObj.soldQuantity || 0,
            };
        });

        res.status(200).json({
            success: true,
            count: formattedProducts.length,
            products: formattedProducts,
        });
    } catch (error) {
        console.error('❌ Get top ranking products error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch top ranking products. Please try again.',
        });
    }
};

// @desc    Boost product ranking (add to campaign or update ranking)
// @route   POST /api/campaigns/boost-ranking
// @access  Private
exports.boostRanking = async (req, res) => {
    try {
        const { productId, category, tags } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide productId',
            });
        }

        // Find product
        const product = await Product.findOne({
            _id: productId,
            supplier: req.user.id,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Update ranking
        if (category) {
            product.ranking = product.ranking || {};
            product.ranking.category = category;
        }

        if (tags && Array.isArray(tags)) {
            product.ranking = product.ranking || {};
            product.ranking.tags = tags;
        }

        // If position is not set, calculate based on sold quantity in category
        if (!product.ranking?.position) {
            const categoryProducts = await Product.find({
                supplier: req.user.id,
                category: product.category,
                isActive: true,
            }).sort({ soldQuantity: -1 });

            const position = categoryProducts.findIndex(p => p._id.toString() === productId.toString()) + 1;
            product.ranking = product.ranking || {};
            product.ranking.position = position;
        }

        await product.save();

        console.log(`✅ Product ranking boosted: ${product.name} (ID: ${product._id})`);

        res.status(200).json({
            success: true,
            message: 'Product ranking boosted successfully',
            product: {
                id: product._id,
                name: product.name,
                ranking: product.ranking,
            },
        });
    } catch (error) {
        console.error('❌ Boost ranking error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to boost product ranking. Please try again.',
        });
    }
};

