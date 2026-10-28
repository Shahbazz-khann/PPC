const { pool } = require('../../config/db');
const logger = require('../../utils/logger');

/**
 * Create a new notification
 */
const createNotification = async ({
  userId = null,
  targetRole = null,
  actorId = null,
  title,
  message,
  type = 'general',
  linkUrl = null,
}) => {
  try {
    const query = `
      INSERT INTO notifications (
        user_id,
        target_role,
        actor_id,
        title,
        message,
        type,
        link_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      userId || null,
      targetRole || null,
      actorId || null,
      title,
      message,
      type,
      linkUrl || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Fetch notifications for a user (including role-targeted notifications for admins)
 */
const getNotificationsForUser = async (userId, roles = [], { limit = 20, offset = 0, unreadOnly = false } = {}) => {
  try {
    const isAdmin = Array.isArray(roles) && roles.some((r) => String(r).toLowerCase().includes('admin'));

    let whereClause;
    const values = [];

    if (isAdmin) {
      // Admins see notifications targeted to 'admin' OR specifically to their user_id
      values.push(userId);
      whereClause = `(n.user_id = $1 OR n.target_role = 'admin')`;
    } else {
      // Customers only see notifications specifically for their user_id
      values.push(userId);
      whereClause = `n.user_id = $1`;
    }

    if (unreadOnly) {
      whereClause += ` AND n.is_read = false`;
    }

    values.push(Math.max(1, parseInt(limit, 10) || 20));
    values.push(Math.max(0, parseInt(offset, 10) || 0));

    const query = `
      SELECT
        n.notification_id,
        n.user_id,
        n.target_role,
        n.actor_id,
        n.title,
        n.message,
        n.type,
        n.link_url,
        n.is_read,
        n.read_at,
        n.created_at,
        TRIM(CONCAT(COALESCE(a.user_first_name, ''), ' ', COALESCE(a.user_last_name, ''))) AS actor_name,
        a.email AS actor_email
      FROM notifications n
      LEFT JOIN users a ON n.actor_id = a.user_id
      WHERE ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length};
    `;

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get count of unread notifications for a user/admin
 */
const getUnreadCount = async (userId, roles = []) => {
  try {
    const isAdmin = Array.isArray(roles) && roles.some((r) => String(r).toLowerCase().includes('admin'));

    let query;
    let values;

    if (isAdmin) {
      query = `
        SELECT COUNT(*)::int AS unread_count
        FROM notifications
        WHERE (user_id = $1 OR target_role = 'admin') AND is_read = false;
      `;
      values = [userId];
    } else {
      query = `
        SELECT COUNT(*)::int AS unread_count
        FROM notifications
        WHERE user_id = $1 AND is_read = false;
      `;
      values = [userId];
    }

    const result = await pool.query(query, values);
    return result.rows[0]?.unread_count || 0;
  } catch (error) {
    logger.error('Error getting unread notification count:', error);
    throw error;
  }
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (notificationId, userId, roles = []) => {
  try {
    const isAdmin = Array.isArray(roles) && roles.some((r) => String(r).toLowerCase().includes('admin'));

    const query = `
      UPDATE notifications
      SET
        is_read = true,
        read_at = NOW(),
        read_by = $2
      WHERE notification_id = $1
        AND (user_id = $2 OR ($3 = true AND target_role = 'admin'))
      RETURNING *;
    `;
    const result = await pool.query(query, [notificationId, userId, isAdmin]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId, roles = []) => {
  try {
    const isAdmin = Array.isArray(roles) && roles.some((r) => String(r).toLowerCase().includes('admin'));

    const query = `
      UPDATE notifications
      SET
        is_read = true,
        read_at = NOW(),
        read_by = $1
      WHERE is_read = false
        AND (user_id = $1 OR ($2 = true AND target_role = 'admin'))
      RETURNING notification_id;
    `;
    const result = await pool.query(query, [userId, isAdmin]);
    return { updatedCount: result.rowCount };
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getNotificationsForUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
