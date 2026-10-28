const notificationModel = require('../../models/Notification/notification.model');
const logger = require('../../utils/logger');

/**
 * Get current user's notifications (includes role-targeted alerts for admins)
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const roles = req.user.roles || [];
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    const notifications = await notificationModel.getNotificationsForUser(userId, roles, {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      unreadOnly: String(unreadOnly).toLowerCase() === 'true',
    });

    const unreadCount = await notificationModel.getUnreadCount(userId, roles);

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    logger.error('Error in getNotifications controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
    });
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const roles = req.user.roles || [];

    const count = await notificationModel.getUnreadCount(userId, roles);

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    logger.error('Error in getUnreadCount controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve unread notification count',
    });
  }
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const roles = req.user.roles || [];
    const notificationId = parseInt(req.params.id, 10);

    if (isNaN(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
    }

    const updated = await notificationModel.markAsRead(notificationId, userId, roles);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied',
      });
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    logger.error('Error in markAsRead controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
    });
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const roles = req.user.roles || [];

    const result = await notificationModel.markAllAsRead(userId, roles);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount: result.updatedCount,
    });
  } catch (error) {
    logger.error('Error in markAllAsRead controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
