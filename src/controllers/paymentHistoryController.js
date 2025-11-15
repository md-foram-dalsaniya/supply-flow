const Payment = require('../models/Payment');
const Order = require('../models/Order');

exports.getPaymentHistory = async (req, res) => {
    try {
        const { orderId, page = 1, limit = 20, status } = req.query;

        const query = { supplier: req.user.id };

        if (orderId) {
            query.order = orderId;
        }

        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const payments = await Payment.find(query)
            .populate('order', 'orderNumber totalAmount customerName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Payment.countDocuments(query);

        res.status(200).json({
            success: true,
            count: payments.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            payments,
        });
    } catch (error) {
        console.error('❌ Get payment history error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment history. Please try again.',
        });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findOne({
            _id: paymentId,
            supplier: req.user.id,
        }).populate('order', 'orderNumber totalAmount customerName customerEmail');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        res.status(200).json({
            success: true,
            payment,
        });
    } catch (error) {
        console.error('❌ Get payment by ID error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment. Please try again.',
        });
    }
};

