const express = require('express');
const router = express.Router();
const notificationController = require('../../controller/Notification/notification.controller');
const { authenticate } = require('../../middlewares/authMiddleware');

// All notification routes require authentication (both Customer and Admin can access)
router.use(authenticate);

// Get list of notifications (with query params: limit, offset, unreadOnly)
router.get('/', notificationController.getNotifications);

// Get unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark a single notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

module.exports = router;
