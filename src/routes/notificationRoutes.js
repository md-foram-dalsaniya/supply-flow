const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} = require('../controllers/notificationController');

// All notification routes are protected
router.use(protect);

// @route   GET /api/notifications
// @desc    Get all notifications
// @access  Private
router.get('/', getNotifications);

// IMPORTANT: Specific routes must come before parameterized routes
// Otherwise Express will match /:id/read first and think "mark-all-read" is an ID

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', markAllAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read (alternative route)
// @access  Private
router.put('/read-all', markAllAsRead);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', markAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', deleteNotification);

module.exports = router;

