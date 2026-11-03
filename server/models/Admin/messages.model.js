const { pool } = require('../../config/db');
const logger = require('../../utils/logger');
const { notifyUser } = require('../../services/notification.service');

const parseMessageId = (rawId) => {
  if (typeof rawId === 'number') return rawId;
  if (!rawId) return null;
  const cleaned = String(rawId).replace(/^MSG-/i, '').trim();
  const parsed = parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const formatAdminMessage = (row) => ({
  id: `MSG-${row.message_id}`,
  messageId: Number(row.message_id),
  customerId: Number(row.customer_id),
  customerName: `${row.customer_first_name || ''} ${row.customer_last_name || ''}`.trim() || row.recipient_name || row.sender_name || 'Customer',
  customerEmail: row.customer_email || null,
  customerMobile: row.customer_mobile || null,
  // From Admin's perspective:
  // If direction is 'outbox' (sent by customer), it is INBOX for admin.
  // If direction is 'inbox' (sent by PPC to customer), it is OUTBOX for admin.
  adminFolder: row.direction === 'outbox' ? 'inbox' : 'outbox',
  direction: row.direction,
  sender: {
    id: row.sender_id,
    name: row.sender_name,
  },
  recipient: {
    id: row.recipient_id,
    name: row.recipient_name,
  },
  department: (row.sender_id === 'PPC-MGMT' || row.recipient_id === 'PPC-MGMT') ? 'PPC-MGMT' : 'PPC-SUPPORT',
  subject: row.subject,
  body: row.body,
  createdAt: row.created_at,
  isReadByCustomer: Boolean(row.is_read),
  readByCustomerAt: row.read_at,
  isAdminRead: Boolean(row.admin_read),
  adminReadAt: row.admin_read_at,
  replyToMessageId: row.reply_to_message_id,
});

/**
 * Get messages for Admin with filtering, search and counters.
 */
const getAdminMessages = async ({
  folder = 'inbox', // 'inbox' (received from customer), 'outbox' (sent by admin), or 'all'
  department = 'all', // 'PPC-MGMT', 'PPC-SUPPORT', or 'all'
  customerId = null,
  search = '',
  unreadOnly = false,
  limit = 50,
  offset = 0,
} = {}) => {
  const conditions = [];
  const values = [];

  // Folder filter (from admin perspective)
  if (folder === 'inbox') {
    // Received from customer
    conditions.push("m.direction = 'outbox'");
  } else if (folder === 'outbox') {
    // Sent by admin / PPC to customer
    conditions.push("m.direction = 'inbox'");
  }

  // Department filter
  if (department && department !== 'all') {
    values.push(department);
    conditions.push(`(m.sender_id = $${values.length} OR m.recipient_id = $${values.length})`);
  }

  // Customer filter
  if (customerId) {
    values.push(customerId);
    conditions.push(`m.customer_id = $${values.length}`);
  }

  // Unread filter
  if (unreadOnly) {
    conditions.push("m.admin_read = false");
  }

  // Search filter
  if (search && search.trim()) {
    values.push(`%${search.trim().toLowerCase()}%`);
    const sIdx = values.length;
    conditions.push(`(
      LOWER(m.subject) LIKE $${sIdx} OR
      LOWER(m.body) LIKE $${sIdx} OR
      LOWER(u.user_first_name) LIKE $${sIdx} OR
      LOWER(u.user_last_name) LIKE $${sIdx} OR
      LOWER(u.email) LIKE $${sIdx} OR
      LOWER(u.mobile) LIKE $${sIdx}
    )`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      m.*,
      u.user_first_name AS customer_first_name,
      u.user_last_name AS customer_last_name,
      u.email AS customer_email,
      u.mobile AS customer_mobile
    FROM customer_messages m
    LEFT JOIN users u ON m.customer_id = u.user_id
    ${whereClause}
    ORDER BY m.created_at DESC
    LIMIT ${parseInt(limit, 10) || 50} OFFSET ${parseInt(offset, 10) || 0}
  `;

  const res = await pool.query(query, values);

  // Compute live admin statistics
  const statsRes = await pool.query(`
    SELECT 
      COUNT(*) FILTER (WHERE direction = 'outbox') AS total_inbox,
      COUNT(*) FILTER (WHERE direction = 'outbox' AND admin_read = false) AS unread_inbox,
      COUNT(*) FILTER (WHERE direction = 'inbox') AS total_outbox,
      COUNT(*) FILTER (WHERE sender_id = 'PPC-MGMT' OR recipient_id = 'PPC-MGMT') AS mgmt_count,
      COUNT(*) FILTER (WHERE sender_id = 'PPC-SUPPORT' OR recipient_id = 'PPC-SUPPORT') AS support_count
    FROM customer_messages
  `);

  const stats = statsRes.rows[0] || {};

  return {
    messages: res.rows.map(formatAdminMessage),
    meta: {
      totalInboxCount: parseInt(stats.total_inbox, 10) || 0,
      unreadInboxCount: parseInt(stats.unread_inbox, 10) || 0,
      totalOutboxCount: parseInt(stats.total_outbox, 10) || 0,
      mgmtCount: parseInt(stats.mgmt_count, 10) || 0,
      supportCount: parseInt(stats.support_count, 10) || 0,
    },
  };
};

/**
 * Get a single message with customer profile and conversation thread.
 */
const getAdminMessageById = async (rawMessageId) => {
  const messageId = parseMessageId(rawMessageId);
  if (!messageId) return null;

  const query = `
    SELECT 
      m.*,
      u.user_first_name AS customer_first_name,
      u.user_last_name AS customer_last_name,
      u.email AS customer_email,
      u.mobile AS customer_mobile
    FROM customer_messages m
    LEFT JOIN users u ON m.customer_id = u.user_id
    WHERE m.message_id = $1
  `;

  const res = await pool.query(query, [messageId]);
  if (res.rows.length === 0) return null;

  const message = formatAdminMessage(res.rows[0]);

  // Mark as read by admin if unread
  if (!message.isAdminRead) {
    await pool.query(
      `UPDATE customer_messages 
       SET admin_read = true, admin_read_at = NOW() 
       WHERE message_id = $1`,
      [messageId]
    );
    message.isAdminRead = true;
    message.adminReadAt = new Date().toISOString();
  }

  // Retrieve full customer conversation thread (latest 20 messages with this customer)
  const threadRes = await pool.query(
    `SELECT 
       m.*,
       u.user_first_name AS customer_first_name,
       u.user_last_name AS customer_last_name,
       u.email AS customer_email,
       u.mobile AS customer_mobile
     FROM customer_messages m
     LEFT JOIN users u ON m.customer_id = u.user_id
     WHERE m.customer_id = $1
     ORDER BY m.created_at ASC
     LIMIT 30`,
    [message.customerId]
  );

  return {
    message,
    thread: threadRes.rows.map(formatAdminMessage),
  };
};

/**
 * Super Admin sends a message or replies to a customer.
 */
const sendAdminMessage = async ({
  customerId,
  department = 'PPC-MGMT',
  subject,
  body,
  replyToMessageId = null,
  adminUserId = null,
}) => {
  // Validate customer - can be passed as user_id or customer_id
  let targetUserId = customerId;
  let userRes = await pool.query(
    'SELECT user_id, user_first_name, user_last_name, email FROM users WHERE user_id = $1',
    [targetUserId]
  );

  if (userRes.rows.length === 0) {
    // Check if passed as customer_id in customers table
    const custLookup = await pool.query(
      'SELECT c.user_id, c.customer_first_name, c.customer_last_name, c.email FROM customers c WHERE c.customer_id = $1',
      [customerId]
    );
    if (custLookup.rows.length > 0) {
      targetUserId = custLookup.rows[0].user_id;
      userRes = await pool.query(
        'SELECT user_id, user_first_name, user_last_name, email FROM users WHERE user_id = $1',
        [targetUserId]
      );
    }
  }

  if (userRes.rows.length === 0) {
    throw new Error('Target customer not found');
  }

  const customer = userRes.rows[0];
  const customerName = `${customer.user_first_name || ''} ${customer.user_last_name || ''}`.trim() || 'Customer';

  const deptKey = department === 'PPC-SUPPORT' ? 'PPC-SUPPORT' : 'PPC-MGMT';
  const deptName = deptKey === 'PPC-SUPPORT' ? 'PPC Support' : 'PPC Management';

  // Insert message into customer's inbox (direction = 'inbox')
  const insertQuery = `
    INSERT INTO customer_messages
      (customer_id, direction, sender_id, sender_name, recipient_id, recipient_name, subject, body, is_read, admin_read, admin_read_at, reply_to_message_id)
    VALUES ($1, 'inbox', $2, $3, 'CUSTOMER', $4, $5, $6, false, true, NOW(), $7)
    RETURNING *
  `;

  const res = await pool.query(insertQuery, [
    targetUserId,
    deptKey,
    deptName,
    customerName,
    subject.trim(),
    body.trim(),
    replyToMessageId || null,
  ]);

  const createdMessage = formatAdminMessage({
    ...res.rows[0],
    customer_first_name: customer.user_first_name,
    customer_last_name: customer.user_last_name,
    customer_email: customer.email,
  });

  // Send in-app notification to customer
  notifyUser({
    userId: targetUserId,
    actorId: adminUserId,
    title: `New Message from ${deptName}`,
    message: subject.trim(),
    type: 'message',
    linkUrl: `/customer/inbox/${createdMessage.id}`,
  }).catch((err) => {
    logger.warn('[Admin Messages] Failed to dispatch user notification:', err.message);
  });

  return createdMessage;
};

/**
 * Explicitly mark a message as read by Admin.
 */
const markAdminMessageAsRead = async (rawMessageId) => {
  const messageId = parseMessageId(rawMessageId);
  if (!messageId) return null;

  const res = await pool.query(
    `UPDATE customer_messages
     SET admin_read = true, admin_read_at = NOW()
     WHERE message_id = $1
     RETURNING *`,
    [messageId]
  );

  if (res.rows.length === 0) return null;
  return formatAdminMessage(res.rows[0]);
};

/**
 * Get active customers list for message recipient selector.
 */
const getCustomersForMessaging = async () => {
  const query = `
    SELECT 
      c.customer_id,
      c.user_id,
      TRIM(CONCAT_WS(' ', c.customer_first_name, c.customer_middle_name, c.customer_last_name)) AS full_name,
      c.email,
      c.mobile
    FROM customers c
    JOIN users u ON c.user_id = u.user_id
    WHERE c.is_active = true
    ORDER BY c.customer_first_name ASC
  `;

  const res = await pool.query(query);
  return res.rows.map((row) => ({
    userId: Number(row.user_id),
    customerId: Number(row.customer_id),
    name: (row.full_name || '').trim() || 'Customer',
    email: row.email,
    mobile: row.mobile,
  }));
};

module.exports = {
  getAdminMessages,
  getAdminMessageById,
  sendAdminMessage,
  markAdminMessageAsRead,
  getCustomersForMessaging,
  parseMessageId,
};

