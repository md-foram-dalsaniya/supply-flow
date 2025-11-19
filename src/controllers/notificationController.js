const Notification = require('../models/Notification');

// Helper function to format time ago (e.g., "30 minutes ago", "Yesterday at 4:32 PM", "Mar 12, 2025")
const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Same day - show "X minutes ago" or "X hours ago"
    if (diffDays === 0) {
        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        } else {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        }
    }

    // Yesterday - show "Yesterday at HH:MM AM/PM"
    if (diffDays === 1) {
        const hours = notificationDate.getHours();
        const minutes = notificationDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `Yesterday at ${displayHours}:${displayMinutes} ${ampm}`;
    }

    // Older dates - show "Mon DD, YYYY" (e.g., "Mar 12, 2025")
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[notificationDate.getMonth()];
    const day = notificationDate.getDate();
    const year = notificationDate.getFullYear();
    return `${month} ${day}, ${year}`;
};

// Helper function to get date group label (Today, Yesterday, or date)
const getDateGroup = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now - notificationDate;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[notificationDate.getMonth()];
        const day = notificationDate.getDate();
        const year = notificationDate.getFullYear();
        return `${month} ${day}, ${year}`;
    }
};

// Helper function to format notification for UI display
const formatNotificationForUI = (notification) => {
    const notificationObj = notification.toObject ? notification.toObject() : notification;
    
    return {
        id: notificationObj._id || notificationObj.id,
        type: notificationObj.type,
        title: notificationObj.title,
        message: notificationObj.message,
        icon: notificationObj.icon,
        isRead: notificationObj.isRead,
        timeAgo: formatTimeAgo(notificationObj.createdAt),
        dateGroup: getDateGroup(notificationObj.createdAt),
        createdAt: notificationObj.createdAt,
        relatedId: notificationObj.relatedId,
        relatedType: notificationObj.relatedType,
        metadata: notificationObj.metadata || {},
    };
};

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

exports.getNotifications = async (req, res) => {
    try {
        const { type, isRead, page = 1, limit = 50 } = req.query;

        const query = { supplier: req.user.id };

        if (type && type !== 'All') {
            query.type = type;
        }

        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            supplier: req.user.id,
            isRead: false,
        });

        // Format notifications for UI display
        const formattedNotifications = notifications.map(formatNotificationForUI);

        // Group notifications by date
        const groupedNotifications = {};
        formattedNotifications.forEach((notification) => {
            const dateGroup = notification.dateGroup;
            if (!groupedNotifications[dateGroup]) {
                groupedNotifications[dateGroup] = [];
            }
            groupedNotifications[dateGroup].push(notification);
        });

        res.status(200).json({
            success: true,
            count: formattedNotifications.length,
            total,
            unreadCount,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            notifications: formattedNotifications,
            groupedByDate: groupedNotifications, // Additional grouped format for UI
        });
    } catch (error) {
        console.error('❌ Get notifications error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
        });
    }
};

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

        const formattedNotification = formatNotificationForUI(notification);

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            notification: formattedNotification,
        });
    } catch (error) {
        console.error('❌ Mark as read error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
        });
    }
};

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
            message: 'Failed to mark all notifications as read',
        });
    }
};

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
            message: 'Failed to delete notification',
        });
    }
};

exports.createNotification = createNotification;

