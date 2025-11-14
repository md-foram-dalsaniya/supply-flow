const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createNotification } = require('../controllers/notificationController');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        // Build query
        const query = { supplier: req.user.id };

        // Filter by status
        if (status && status !== 'All') {
            query.status = status;
        }

        // Search functionality (by order number, customer name, or customer email)
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { customerEmail: { $regex: search, $options: 'i' } },
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const orders = await Order.find(query)
            .populate('items.product', 'name image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Order.countDocuments(query);

        // Get status counts for filter badges
        const statusCounts = await Order.aggregate([
            { $match: { supplier: req.user.id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const statusMap = {};
        statusCounts.forEach((item) => {
            statusMap[item._id] = item.count;
        });

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            statusCounts: statusMap,
            orders,
        });
    } catch (error) {
        console.error('❌ Get orders error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders. Please try again.',
        });
    }
};

// @desc    Get recent orders
// @route   GET /api/orders/recent
// @access  Private
exports.getRecentOrders = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const orders = await Order.find({ supplier: req.user.id })
            .populate('items.product', 'name image')
            .sort({ createdAt: -1 })
            .limit(limit);

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error('❌ Get recent orders error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent orders. Please try again.',
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        }).populate('items.product', 'name image category');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Sort order history by timestamp (newest first)
        if (order.orderHistory) {
            order.orderHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error('❌ Get order error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order. Please try again.',
        });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { items, customerName, customerEmail, customerPhone, customerType, deliveryAddress, deliveryMethod, deliveryTime, paymentMethod, notes } = req.body;

        // Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one order item',
            });
        }

        // Validate and process items
        const orderItems = [];
        let totalAmount = 0;

        for (const item of items) {
            // Validate productId
            if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid product ID: ${item.productId || 'missing'}. Please provide a valid product ID.`,
                });
            }

            // Validate quantity
            if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid quantity for product ${item.productId}. Quantity must be a number greater than 0.`,
                });
            }

            // Find product
            const product = await Product.findOne({
                _id: item.productId,
                supplier: req.user.id,
                isActive: true,
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${item.productId} not found or does not belong to your account.`,
                });
            }

            // Check stock availability
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
                });
            }

            const subtotal = product.price * item.quantity;
            totalAmount += subtotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                subtotal,
            });
        }

        // Create order
        const order = await Order.create({
            supplier: req.user.id,
            items: orderItems,
            totalAmount,
            customerName: customerName || '',
            customerEmail: customerEmail || '',
            customerPhone: customerPhone || '',
            customerType: customerType || 'Other',
            deliveryAddress: deliveryAddress || '',
            deliveryMethod: deliveryMethod || 'Standard Delivery',
            deliveryTime: deliveryTime || '',
            paymentMethod: paymentMethod || null,
            notes: notes || '',
            status: 'New Order',
            orderHistory: [{
                status: 'New Order',
                note: 'Order created',
                updatedBy: 'System',
                timestamp: new Date(),
            }],
        });

        // Update product stock and sold quantity
        for (const item of items) {
            try {
                const updatedProduct = await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: -item.quantity, soldQuantity: item.quantity } },
                    { new: true }
                );

                // Check for low stock and create notification (non-blocking)
                if (updatedProduct && updatedProduct.stock <= updatedProduct.lowStockThreshold) {
                    try {
                        await createNotification(
                            req.user.id,
                            'Product',
                            'Low Stock Alert',
                            `Your product '${updatedProduct.name}' has low stock (only ${updatedProduct.stock} units left).`,
                            'alert',
                            updatedProduct._id,
                            'Product',
                            { stock: updatedProduct.stock, threshold: updatedProduct.lowStockThreshold }
                        );
                    } catch (notifError) {
                        console.error('⚠️ Failed to create low stock notification:', notifError.message);
                        // Don't fail the order if notification fails
                    }
                }
            } catch (stockError) {
                console.error('❌ Error updating product stock:', stockError.message);
                // If stock update fails, we should rollback the order
                // For now, log the error but continue
            }
        }

        // Create new order notification (non-blocking)
        try {
            await createNotification(
                req.user.id,
                'Order',
                `New Order #${order.orderNumber}`,
                `${order.customerName || 'Customer'} placed an order for ${order.items.length} items with a total of $${order.totalAmount.toFixed(2)}.`,
                'order',
                order._id,
                'Order',
                { orderNumber: order.orderNumber, totalAmount: order.totalAmount, itemCount: order.items.length }
            );
        } catch (notifError) {
            console.error('⚠️ Failed to create order notification:', notifError.message);
            // Don't fail the order if notification fails
        }

        const populatedOrder = await Order.findById(order._id).populate('items.product', 'name image');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: populatedOrder,
        });
    } catch (error) {
        console.error('❌ Create order error:', error.message);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error code:', error.code);

        // Handle specific error types
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format. Please check the product IDs you provided.',
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error: ' + messages.join(', '),
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate order number. Please try again.',
            });
        }

        // Return more detailed error in development
        const errorMessage = process.env.NODE_ENV === 'development'
            ? error.message
            : 'Failed to create order. Please check your information and try again.';

        res.status(500).json({
            success: false,
            message: errorMessage,
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;

        // Validation
        const validStatuses = [
            'Pending',
            'New Order',
            'Needs confirmation',
            'Processing',
            'Confirmed',
            'Ready',
            'Ready for pickup',
            'Out for delivery',
            'Delivered',
            'Completed',
            'Cancelled',
        ];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Please provide a valid status. Valid statuses: ${validStatuses.join(', ')}`,
            });
        }

        // Find order
        const order = await Order.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Update status
        const oldStatus = order.status;
        order.status = status;

        // Add to order history
        if (!order.orderHistory) {
            order.orderHistory = [];
        }
        order.orderHistory.push({
            status: status,
            note: note || `Status changed from ${oldStatus} to ${status}`,
            updatedBy: req.user.name || 'Supplier',
            timestamp: new Date(),
        });

        await order.save();

        // Create notification for status change
        if (status === 'Delivered' || status === 'Completed') {
            await createNotification(
                req.user.id,
                'Order',
                `Order ${status}`,
                `Order #${order.orderNumber} has been ${status.toLowerCase()}.`,
                'order',
                order._id,
                'Order',
                { orderNumber: order.orderNumber, status }
            );
        }

        const populatedOrder = await Order.findById(order._id).populate('items.product', 'name image');

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order: populatedOrder,
        });
    } catch (error) {
        console.error('❌ Update order status error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status. Please try again.',
        });
    }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = async (req, res) => {
    try {
        const { customerName, customerEmail, customerPhone, deliveryAddress, notes } = req.body;

        // Find order
        const order = await Order.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Update fields
        if (customerName !== undefined) order.customerName = customerName;
        if (customerEmail !== undefined) order.customerEmail = customerEmail;
        if (customerPhone !== undefined) order.customerPhone = customerPhone;
        if (deliveryAddress !== undefined) order.deliveryAddress = deliveryAddress;
        if (notes !== undefined) order.notes = notes;

        await order.save();

        const populatedOrder = await Order.findById(order._id).populate('items.product', 'name image');

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            order: populatedOrder,
        });
    } catch (error) {
        console.error('❌ Update order error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update order. Please check your information and try again.',
        });
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Restore product stock and sold quantity if order is cancelled
        if (order.status !== 'Cancelled' && order.status !== 'Delivered') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity, soldQuantity: -item.quantity },
                });
            }
        }

        await Order.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully',
        });
    } catch (error) {
        console.error('❌ Delete order error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to delete order. Please try again.',
        });
    }
};

