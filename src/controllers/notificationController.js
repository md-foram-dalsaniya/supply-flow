const Notification = require('../models/Notification');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Campaign = require('../models/Campaign');

// Helper function to create notification
const createNotification = async (supplierId, type, title, message, icon, relatedId = null, relatedType = null, metadata = {}) => {
    try {
        const notification = await Notification.create({
            supplier: supplierId,
            type,
            title,
            message,
            icon,
            relatedId,
            relatedType,
            metadata,
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const { type, isRead, page = 1, limit = 50 } = req.query;

        // Build query
        const query = { supplier: req.user.id };

        // Filter by type
        if (type && type !== 'All') {
            query.type = type;
        }

        // Filter by read status
        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            supplier: req.user.id,
            isRead: false,
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            total,
            unreadCount,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            notifications,
        });
    } catch (error) {
        console.error('❌ Get notifications error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while fetching notifications',
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            notification,
        });
    } catch (error) {
        console.error('❌ Mark as read error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while marking notification as read',
        });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read or /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { supplier: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );

        console.log(`✅ Marked ${result.modifiedCount} notification(s) as read`);

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            count: result.modifiedCount,
        });
    } catch (error) {
        console.error('❌ Mark all as read error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read. Please try again.',
        });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        await Notification.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
        });
    } catch (error) {
        console.error('❌ Delete notification error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while deleting notification',
        });
    }
};

// Export helper function for use in other controllers
exports.createNotification = createNotification;

