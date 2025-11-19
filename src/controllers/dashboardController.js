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

        // Format recent orders for dashboard display
        const formattedRecentOrders = recentOrders.map((order) => ({
            id: order._id,
            orderNumber: order.orderNumber,
            itemsCount: order.items.length,
            totalAmount: order.totalAmount,
            status: order.status,
            customerName: order.customerName,
            createdAt: order.createdAt,
            items: order.items.map((item) => ({
                id: item.product?._id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
                image: item.product?.image,
            })),
        }));

        // Get current date formatted
        const currentDate = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);

        res.status(200).json({
            success: true,
            data: {
                currentDate: formattedDate, // "Tuesday, March 15, 2025"
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
                recentOrders: formattedRecentOrders,
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

// @desc    Get KPIs with week-over-week comparison
// @route   GET /api/dashboard/kpis
// @access  Private
exports.getKPIs = async (req, res) => {
    try {
        const supplierId = req.user.id;

        // Get current week (last 7 days)
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

        // Get previous week (7 days before that)
        const prevWeekEnd = new Date(startDate);
        prevWeekEnd.setMilliseconds(prevWeekEnd.getMilliseconds() - 1);
        const prevWeekStart = new Date(startDate);
        prevWeekStart.setDate(prevWeekStart.getDate() - 7);

        // Current week orders
        const currentWeekOrders = await Order.find({
            supplier: supplierId,
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $ne: 'Cancelled' },
        });

        // Previous week orders
        const previousWeekOrders = await Order.find({
            supplier: supplierId,
            createdAt: { $gte: prevWeekStart, $lte: prevWeekEnd },
            status: { $ne: 'Cancelled' },
        });

        // Calculate Total Sales
        const currentWeekSales = currentWeekOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const previousWeekSales = previousWeekOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const salesChange = previousWeekSales > 0
            ? ((currentWeekSales - previousWeekSales) / previousWeekSales * 100).toFixed(0)
            : currentWeekSales > 0 ? 100 : 0;

        // Calculate Total Orders
        const currentWeekOrdersCount = currentWeekOrders.length;
        const previousWeekOrdersCount = previousWeekOrders.length;
        const ordersChange = previousWeekOrdersCount > 0
            ? ((currentWeekOrdersCount - previousWeekOrdersCount) / previousWeekOrdersCount * 100).toFixed(0)
            : currentWeekOrdersCount > 0 ? 100 : 0;

        // Calculate Average Order Value
        const currentAvgOrderValue = currentWeekOrdersCount > 0
            ? currentWeekSales / currentWeekOrdersCount
            : 0;
        const previousAvgOrderValue = previousWeekOrdersCount > 0
            ? previousWeekSales / previousWeekOrdersCount
            : 0;
        const avgOrderValueChange = previousAvgOrderValue > 0
            ? ((currentAvgOrderValue - previousAvgOrderValue) / previousAvgOrderValue * 100).toFixed(0)
            : currentAvgOrderValue > 0 ? 100 : 0;

        // Calculate New Customers (unique customer emails)
        const currentWeekCustomers = new Set(
            currentWeekOrders
                .map(order => order.customerEmail)
                .filter(email => email && email.trim() !== '')
        );
        const previousWeekCustomers = new Set(
            previousWeekOrders
                .map(order => order.customerEmail)
                .filter(email => email && email.trim() !== '')
        );

        // New customers are those in current week but not in previous week
        const newCustomers = Array.from(currentWeekCustomers).filter(
            email => !previousWeekCustomers.has(email)
        ).length;

        // Previous week new customers (for comparison)
        const previousWeekNewCustomers = Array.from(previousWeekCustomers).filter(
            email => !currentWeekCustomers.has(email)
        ).length;

        const newCustomersChange = previousWeekNewCustomers > 0
            ? ((newCustomers - previousWeekNewCustomers) / previousWeekNewCustomers * 100).toFixed(0)
            : newCustomers > 0 ? 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                totalSales: {
                    value: parseFloat(currentWeekSales.toFixed(2)),
                    change: parseFloat(salesChange),
                    changeType: parseFloat(salesChange) >= 0 ? 'increase' : 'decrease',
                },
                totalOrders: {
                    value: currentWeekOrdersCount,
                    change: parseFloat(ordersChange),
                    changeType: parseFloat(ordersChange) >= 0 ? 'increase' : 'decrease',
                },
                avgOrderValue: {
                    value: parseFloat(currentAvgOrderValue.toFixed(2)),
                    change: parseFloat(avgOrderValueChange),
                    changeType: parseFloat(avgOrderValueChange) >= 0 ? 'increase' : 'decrease',
                },
                newCustomers: {
                    value: newCustomers,
                    change: parseFloat(newCustomersChange),
                    changeType: parseFloat(newCustomersChange) >= 0 ? 'increase' : 'decrease',
                },
            },
        });
    } catch (error) {
        console.error('❌ Get KPIs error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch KPIs. Please try again.',
        });
    }
};

// @desc    Get sales overview graph data
// @route   GET /api/dashboard/sales-overview
// @access  Private
exports.getSalesOverview = async (req, res) => {
    try {
        const supplierId = req.user.id;
        const { period = 'daily' } = req.query; // daily, weekly, monthly

        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        let startDate = new Date();

        // Set start date based on period
        if (period === 'daily') {
            // Last 7 days
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'weekly') {
            // Last 4 weeks
            startDate.setDate(startDate.getDate() - 28);
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'monthly') {
            // Last 12 months
            startDate.setMonth(startDate.getMonth() - 12);
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        }

        const orders = await Order.find({
            supplier: supplierId,
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $ne: 'Cancelled' },
        });

        let dataPoints = [];

        if (period === 'daily') {
            // Group by day of week
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const salesByDay = {};

            orders.forEach((order) => {
                const dayOfWeek = daysOfWeek[order.createdAt.getDay()];
                if (!salesByDay[dayOfWeek]) {
                    salesByDay[dayOfWeek] = 0;
                }
                salesByDay[dayOfWeek] += order.totalAmount;
            });

            // Create data points for each day
            dataPoints = daysOfWeek.map((day) => ({
                label: day,
                value: parseFloat((salesByDay[day] || 0).toFixed(2)),
            }));
        } else if (period === 'weekly') {
            // Group by week
            const salesByWeek = {};
            orders.forEach((order) => {
                const weekStart = new Date(order.createdAt);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                weekStart.setHours(0, 0, 0, 0);
                const weekKey = weekStart.toISOString().split('T')[0];

                if (!salesByWeek[weekKey]) {
                    salesByWeek[weekKey] = 0;
                }
                salesByWeek[weekKey] += order.totalAmount;
            });

            dataPoints = Object.keys(salesByWeek)
                .sort()
                .map((weekKey) => ({
                    label: `Week ${new Date(weekKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                    value: parseFloat(salesByWeek[weekKey].toFixed(2)),
                }));
        } else if (period === 'monthly') {
            // Group by month
            const salesByMonth = {};
            orders.forEach((order) => {
                const monthKey = order.createdAt.toISOString().substring(0, 7); // YYYY-MM

                if (!salesByMonth[monthKey]) {
                    salesByMonth[monthKey] = 0;
                }
                salesByMonth[monthKey] += order.totalAmount;
            });

            dataPoints = Object.keys(salesByMonth)
                .sort()
                .map((monthKey) => {
                    const date = new Date(monthKey + '-01');
                    return {
                        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                        value: parseFloat(salesByMonth[monthKey].toFixed(2)),
                    };
                });
        }

        res.status(200).json({
            success: true,
            period,
            data: dataPoints,
        });
    } catch (error) {
        console.error('❌ Get sales overview error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sales overview. Please try again.',
        });
    }
};

// @desc    Get top products by revenue or units sold
// @route   GET /api/dashboard/top-products
// @access  Private
exports.getTopProducts = async (req, res) => {
    try {
        const supplierId = req.user.id;
        const { limit = 10, sortBy = 'revenue' } = req.query; // revenue or units

        // Get orders (last 30 days for top products)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);

        const orders = await Order.find({
            supplier: supplierId,
            createdAt: { $gte: startDate },
            status: { $ne: 'Cancelled' },
        }).populate('items.product', 'name image');

        // Aggregate product sales
        const productSales = {};

        orders.forEach((order) => {
            order.items.forEach((item) => {
                const productId = item.product?._id?.toString() || item.product?.toString();
                if (!productId) return;

                if (!productSales[productId]) {
                    productSales[productId] = {
                        productId,
                        productName: item.name,
                        productImage: item.product?.image || null,
                        unitsSold: 0,
                        revenue: 0,
                    };
                }

                productSales[productId].unitsSold += item.quantity;
                productSales[productId].revenue += item.subtotal;
            });
        });

        // Convert to array and sort
        let topProducts = Object.values(productSales);

        if (sortBy === 'revenue') {
            topProducts.sort((a, b) => b.revenue - a.revenue);
        } else {
            topProducts.sort((a, b) => b.unitsSold - a.unitsSold);
        }

        // Limit results
        topProducts = topProducts.slice(0, parseInt(limit));

        // Format response
        const formattedProducts = topProducts.map((product, index) => ({
            rank: index + 1,
            productId: product.productId,
            productName: product.productName,
            productImage: product.productImage,
            unitsSold: product.unitsSold,
            revenue: parseFloat(product.revenue.toFixed(2)),
        }));

        res.status(200).json({
            success: true,
            sortBy,
            count: formattedProducts.length,
            products: formattedProducts,
        });
    } catch (error) {
        console.error('❌ Get top products error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch top products. Please try again.',
        });
    }
};

// @desc    Get customer demographics by customer type
// @route   GET /api/dashboard/customer-demographics
// @access  Private
exports.getCustomerDemographics = async (req, res) => {
    try {
        const supplierId = req.user.id;

        // Get all orders
        const orders = await Order.find({
            supplier: supplierId,
            status: { $ne: 'Cancelled' },
        });

        // Count customers by type
        const demographics = {
            'Contractor': 0,
            'DIY Homeowner': 0,
            'Business': 0,
            'Other': 0,
        };

        const uniqueCustomers = new Set();

        orders.forEach((order) => {
            const customerType = order.customerType || 'Other';
            const customerKey = `${order.customerEmail || order.customerName || 'unknown'}-${customerType}`;

            // Count unique customers per type
            if (!uniqueCustomers.has(customerKey)) {
                uniqueCustomers.add(customerKey);
                demographics[customerType] = (demographics[customerType] || 0) + 1;
            }
        });

        // Calculate total and percentages
        const total = Object.values(demographics).reduce((sum, count) => sum + count, 0);

        const formattedDemographics = Object.keys(demographics).map((type) => ({
            type,
            count: demographics[type],
            percentage: total > 0 ? parseFloat(((demographics[type] / total) * 100).toFixed(1)) : 0,
        }));

        res.status(200).json({
            success: true,
            total,
            demographics: formattedDemographics,
        });
    } catch (error) {
        console.error('❌ Get customer demographics error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer demographics. Please try again.',
        });
    }
};

