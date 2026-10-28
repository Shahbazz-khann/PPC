import api from './api';

/**
 * Fetch paginated notifications for current user/admin
 * @param {Object} params - { limit, offset, unreadOnly }
 */
export const getNotifications = async (params = {}) => {
  return await api.get('/notifications', params);
};

/**
 * Fetch the current unread notifications count
 */
export const getUnreadNotificationCount = async () => {
  return await api.get('/notifications/unread-count');
};

/**
 * Mark a single notification as read
 * @param {number|string} notificationId
 */
export const markNotificationAsRead = async (notificationId) => {
  return await api.patch(`/notifications/${notificationId}/read`);
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  return await api.patch('/notifications/mark-all-read');
};
