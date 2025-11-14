const Order = require('../models/Order');
const Product = require('../models/Product');
const StoreSettings = require('../models/StoreSettings');
const Review = require('../models/Review');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
    try {
        const supplierId = req.user.id;

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get yesterday's date range
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Today's sales
        const todayOrders = await Order.find({
            supplier: supplierId,
            createdAt: { $gte: today, $lt: tomorrow },
            status: { $ne: 'Cancelled' },
        });

        const todaySales = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Yesterday's sales
        const yesterdayOrders = await Order.find({
            supplier: supplierId,
            createdAt: { $gte: yesterday, $lt: today },
            status: { $ne: 'Cancelled' },
        });

        const yesterdaySales = yesterdayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Calculate sales percentage change
        const salesChange = yesterdaySales > 0
            ? ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(0)
            : todaySales > 0 ? 100 : 0;

        // Today's orders count
        const todayOrdersCount = todayOrders.length;
        const yesterdayOrdersCount = yesterdayOrders.length;

        // Calculate orders percentage change
        const ordersChange = yesterdayOrdersCount > 0
            ? ((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount * 100).toFixed(0)
            : todayOrdersCount > 0 ? 100 : 0;

        // Get store settings (rating, status)
        let storeSettings = await StoreSettings.findOne({ supplier: supplierId });

        if (!storeSettings) {
            // Create default store settings
            storeSettings = await StoreSettings.create({
                supplier: supplierId,
                isOpen: true,
                openingTime: '09:00',
                closingTime: '21:00',
                rating: 0,
                totalRatings: 0,
                ratingCount: 0,
            });
        }

        // Calculate closing time display
        const closingTime = storeSettings.closingTime || '21:00';
        const isOpen = storeSettings.isOpen;

        // Get recent orders (limit 5)
        const recentOrders = await Order.find({ supplier: supplierId })
            .populate('items.product', 'name image')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                todaySales: {
                    amount: todaySales.toFixed(2),
                    change: parseFloat(salesChange),
                    changeType: parseFloat(salesChange) >= 0 ? 'increase' : 'decrease',
                },
                orders: {
                    count: todayOrdersCount,
                    change: parseFloat(ordersChange),
                    changeType: parseFloat(ordersChange) >= 0 ? 'increase' : 'decrease',
                },
                rating: {
                    value: storeSettings.rating.toFixed(1),
                    count: storeSettings.ratingCount,
                },
                storeStatus: {
                    isOpen,
                    closingTime,
                    message: isOpen ? `Until ${closingTime}` : 'Closed',
                },
                recentOrders,
            },
        });
    } catch (error) {
        console.error('❌ Get dashboard error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data. Please try again.',
        });
    }
};

// @desc    Get analytics data
// @route   GET /api/dashboard/analytics
// @access  Private
exports.getAnalytics = async (req, res) => {
    try {
        const supplierId = req.user.id;
        const { period = '7d' } = req.query; // 7d, 30d, 90d, 1y

        // Calculate date range based on period
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        // Get orders in date range
        const orders = await Order.find({
            supplier: supplierId,
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $ne: 'Cancelled' },
        });

        // Calculate total sales
        const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Calculate total orders
        const totalOrders = orders.length;

        // Get product count
        const totalProducts = await Product.countDocuments({
            supplier: supplierId,
            isActive: true,
        });

        // Get low stock products
        const lowStockProducts = await Product.find({
            supplier: supplierId,
            isActive: true,
            $expr: { $lte: ['$stock', '$lowStockThreshold'] },
        });

        // Sales by status
        const salesByStatus = {};
        orders.forEach((order) => {
            if (!salesByStatus[order.status]) {
                salesByStatus[order.status] = 0;
            }
            salesByStatus[order.status] += order.totalAmount;
        });

        res.status(200).json({
            success: true,
            period,
            data: {
                totalSales: totalSales.toFixed(2),
                totalOrders,
                totalProducts,
                lowStockCount: lowStockProducts.length,
                salesByStatus,
                lowStockProducts: lowStockProducts.map((p) => ({
                    id: p._id,
                    name: p.name,
                    stock: p.stock,
                    lowStockThreshold: p.lowStockThreshold,
                })),
            },
        });
    } catch (error) {
        console.error('❌ Get analytics error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics. Please try again.',
        });
    }
};

