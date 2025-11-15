const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} = require('../controllers/notificationController');

router.use(protect);

// Specific routes must come before parameterized routes
router.put('/mark-all-read', markAllAsRead);
router.put('/read-all', markAllAsRead);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;

