const { pool } = require('../../config/db');
const logger = require('../../utils/logger');

/**
 * Format a raw database row into the standardized customer message object.
 */
const formatMessage = (row) => ({
  id: `MSG-${row.message_id}`,
  messageId: Number(row.message_id),
  direction: row.direction,
  sender: {
    id: row.sender_id,
    name: row.sender_name,
  },
  recipient: {
    id: row.recipient_id,
    name: row.recipient_name,
  },
  subject: row.subject,
  body: row.body,
  createdAt: row.created_at,
  isRead: Boolean(row.is_read),
  readAt: row.read_at,
  replyToMessageId: row.reply_to_message_id,
});

/**
 * Helper to extract integer message ID from string like "MSG-1001" or number 1001.
 */
const parseMessageId = (rawId) => {
  if (typeof rawId === 'number') return rawId;
  if (!rawId) return null;
  const cleaned = String(rawId).replace(/^MSG-/i, '').trim();
  const parsed = parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Seeds initial welcome and update messages for new customers if inbox is empty.
 */
const seedInitialMessagesIfEmpty = async (userId) => {
  try {
    const countRes = await pool.query(
      'SELECT COUNT(*)::int AS count FROM customer_messages WHERE customer_id = $1',
      [userId]
    );

    if (countRes.rows[0].count > 0) {
      return;
    }

    // Get customer name
    const userRes = await pool.query(
      'SELECT user_first_name, user_last_name FROM users WHERE user_id = $1',
      [userId]
    );
    const user = userRes.rows[0] || {};
    const customerName = `${user.user_first_name || ''} ${user.user_last_name || ''}`.trim() || 'Customer';

    const seedQueries = [
      {
        direction: 'inbox',
        sender_id: 'PPC-SUPPORT',
        sender_name: 'PPC Support',
        recipient_id: 'CUSTOMER',
        recipient_name: customerName,
        subject: 'Welcome to PPC Customer Portal',
        body: 'Welcome to your new PPC portal! You can use this dashboard to manage your properties, requests, property visits, and communicate directly with us.',
        is_read: true,
        reply_to_message_id: null,
      },
    ];

    for (const msg of seedQueries) {
      await pool.query(
        `INSERT INTO customer_messages 
          (customer_id, direction, sender_id, sender_name, recipient_id, recipient_name, subject, body, is_read, reply_to_message_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          userId,
          msg.direction,
          msg.sender_id,
          msg.sender_name,
          msg.recipient_id,
          msg.recipient_name,
          msg.subject,
          msg.body,
          msg.is_read,
          msg.reply_to_message_id,
        ]
      );
    }
    logger.info(`[Messages] Seeded initial messages for customer ${userId}`);
  } catch (err) {
    logger.error(`[Messages] Failed to seed initial messages for customer ${userId}:`, err);
  }
};

/**
 * Retrieve messages for customer with optional folder and search filters.
 */
const getCustomerMessages = async (userId, { folder, search } = {}) => {
  // Ensure default seed exists for customer
  await seedInitialMessagesIfEmpty(userId);

  const values = [userId];
  const conditions = ['customer_id = $1'];

  if (folder && (folder === 'inbox' || folder === 'outbox')) {
    values.push(folder);
    conditions.push(`direction = $${values.length}`);
  }

  if (search && search.trim()) {
    values.push(`%${search.trim().toLowerCase()}%`);
    const sIndex = values.length;
    conditions.push(`(
      LOWER(subject) LIKE $${sIndex} OR 
      LOWER(body) LIKE $${sIndex} OR 
      LOWER(sender_name) LIKE $${sIndex} OR 
      LOWER(recipient_name) LIKE $${sIndex}
    )`);
  }

  const query = `
    SELECT * FROM customer_messages
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
  `;

  const res = await pool.query(query, values);

  // Also calculate total statistics for folders
  const statsRes = await pool.query(
    `SELECT 
       COUNT(*) FILTER (WHERE direction = 'inbox') AS inbox_count,
       COUNT(*) FILTER (WHERE direction = 'inbox' AND is_read = false) AS unread_count,
       COUNT(*) FILTER (WHERE direction = 'outbox') AS outbox_count
     FROM customer_messages
     WHERE customer_id = $1`,
    [userId]
  );

  const stats = statsRes.rows[0] || { inbox_count: 0, unread_count: 0, outbox_count: 0 };

  return {
    messages: res.rows.map(formatMessage),
    meta: {
      inboxCount: parseInt(stats.inbox_count, 10) || 0,
      unreadCount: parseInt(stats.unread_count, 10) || 0,
      outboxCount: parseInt(stats.outbox_count, 10) || 0,
    },
  };
};

/**
 * Get a single message by ID.
 */
const getCustomerMessageById = async (userId, rawMessageId) => {
  const messageId = parseMessageId(rawMessageId);
  if (!messageId) return null;

  const res = await pool.query(
    'SELECT * FROM customer_messages WHERE customer_id = $1 AND message_id = $2',
    [userId, messageId]
  );

  if (res.rows.length === 0) return null;
  return formatMessage(res.rows[0]);
};

/**
 * Create a new message from customer to PPC (MGMT or SUPPORT).
 */
const createCustomerMessage = async (userId, { to, subject, body, replyToMessageId }) => {
  // Get customer user record
  const userRes = await pool.query(
    'SELECT user_first_name, user_last_name, email FROM users WHERE user_id = $1',
    [userId]
  );
  const user = userRes.rows[0] || {};
  const customerName = `${user.user_first_name || ''} ${user.user_last_name || ''}`.trim() || 'Customer';

  const recipientRole = to === 'PPC-MGMT' ? 'PPC-MGMT' : 'PPC-SUPPORT';
  const recipientName = recipientRole === 'PPC-MGMT' ? 'PPC Management' : 'PPC Support';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert customer's outbox message
    const insertOutboxQuery = `
      INSERT INTO customer_messages 
        (customer_id, direction, sender_id, sender_name, recipient_id, recipient_name, subject, body, is_read, reply_to_message_id)
      VALUES ($1, 'outbox', 'CUSTOMER', $2, $3, $4, $5, $6, true, $7)
      RETURNING *
    `;
    const outboxRes = await client.query(insertOutboxQuery, [
      userId,
      customerName,
      recipientRole,
      recipientName,
      subject.trim(),
      body.trim(),
      replyToMessageId || null,
    ]);

    const createdOutboxMessage = formatMessage(outboxRes.rows[0]);

    // 2. Automatically generate an acknowledgment in customer's inbox
    const autoReplySubject = subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`;
    const autoReplyBody = `Thank you for contacting ${recipientName}. We have received your message regarding "${subject}". Our team will review your inquiry and follow up with you as soon as possible.`;

    const insertInboxQuery = `
      INSERT INTO customer_messages
        (customer_id, direction, sender_id, sender_name, recipient_id, recipient_name, subject, body, is_read, reply_to_message_id)
      VALUES ($1, 'inbox', $2, $3, 'CUSTOMER', $4, $5, $6, false, $7)
      RETURNING *
    `;
    const inboxRes = await client.query(insertInboxQuery, [
      userId,
      recipientRole,
      recipientName,
      customerName,
      autoReplySubject,
      autoReplyBody,
      createdOutboxMessage.id,
    ]);

    await client.query('COMMIT');

    return {
      sentMessage: createdOutboxMessage,
      autoReplyMessage: formatMessage(inboxRes.rows[0]),
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Mark a message as read.
 */
const markCustomerMessageAsRead = async (userId, rawMessageId) => {
  const messageId = parseMessageId(rawMessageId);
  if (!messageId) return null;

  const res = await pool.query(
    `UPDATE customer_messages
     SET is_read = true, read_at = NOW()
     WHERE customer_id = $1 AND message_id = $2
     RETURNING *`,
    [userId, messageId]
  );

  if (res.rows.length === 0) return null;
  return formatMessage(res.rows[0]);
};

/**
 * Send an automated or system message to a customer's inbox.
 */
const sendSystemMessageToCustomer = async ({
  userId,
  senderId = 'PPC-MGMT',
  senderName = 'PPC Management',
  subject,
  body,
}) => {
  try {
    const userRes = await pool.query(
      'SELECT user_first_name, user_last_name FROM users WHERE user_id = $1',
      [userId]
    );
    const user = userRes.rows[0] || {};
    const customerName = `${user.user_first_name || ''} ${user.user_last_name || ''}`.trim() || 'Customer';

    await pool.query(
      `INSERT INTO customer_messages 
        (customer_id, direction, sender_id, sender_name, recipient_id, recipient_name, subject, body, is_read, reply_to_message_id)
       VALUES ($1, 'inbox', $2, $3, 'CUSTOMER', $4, $5, $6, false, null)`,
      [userId, senderId, senderName, customerName, subject, body]
    );
    logger.info(`[Messages] System message sent to customer ${userId}: "${subject}"`);
  } catch (err) {
    logger.error(`[Messages] Failed to send system message to customer ${userId}:`, err);
  }
};

module.exports = {
  getCustomerMessages,
  getCustomerMessageById,
  createCustomerMessage,
  markCustomerMessageAsRead,
  parseMessageId,
  sendSystemMessageToCustomer,
};
