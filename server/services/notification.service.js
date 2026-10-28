const notificationModel = require('../models/Notification/notification.model');
const logger = require('../utils/logger');

/**
 * Dispatch notification to all Admins (e.g., when a customer adds a property or request)
 */
const notifyAdmins = async ({ actorId = null, title, message, type = 'general', linkUrl = null }) => {
  try {
    const notification = await notificationModel.createNotification({
      targetRole: 'admin',
      actorId,
      title,
      message,
      type,
      linkUrl,
    });
    logger.info(`[Notification] Admin alert created: "${title}" by actor ID ${actorId}`);
    return notification;
  } catch (err) {
    logger.error('[Notification] Failed to notify admins:', err);
    // Don't crash parent flow if notification fails
    return null;
  }
};

/**
 * Dispatch notification to a specific User/Customer (e.g., when an admin approves or updates a status)
 */
const notifyUser = async ({ userId, actorId = null, title, message, type = 'general', linkUrl = null }) => {
  if (!userId) {
    logger.warn('[Notification] notifyUser called without userId');
    return null;
  }
  try {
    const notification = await notificationModel.createNotification({
      userId,
      actorId,
      title,
      message,
      type,
      linkUrl,
    });
    logger.info(`[Notification] User alert created for user ${userId}: "${title}"`);
    return notification;
  } catch (err) {
    logger.error(`[Notification] Failed to notify user ${userId}:`, err);
    return null;
  }
};

module.exports = {
  notifyAdmins,
  notifyUser,
};
