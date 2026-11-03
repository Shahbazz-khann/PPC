const adminMessagesModel = require('../../models/Admin/messages.model');
const logger = require('../../utils/logger');

/**
 * GET /api/v1/admin/messages
 * Query params: folder (inbox|outbox|all), department (all|PPC-MGMT|PPC-SUPPORT), customerId, search, unreadOnly
 */
const getMessages = async (req, res, next) => {
  try {
    const { folder, department, customerId, search, unreadOnly, limit, offset } = req.query;

    const result = await adminMessagesModel.getAdminMessages({
      folder: folder || 'inbox',
      department: department || 'all',
      customerId: customerId ? parseInt(customerId, 10) : null,
      search,
      unreadOnly: unreadOnly === 'true' || unreadOnly === true,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    return res.status(200).json({
      success: true,
      message: 'Admin messages retrieved successfully',
      data: result.messages,
      meta: result.meta,
    });
  } catch (error) {
    logger.error('[Admin Messages Controller] Error getting messages:', error);
    next(error);
  }
};

/**
 * GET /api/v1/admin/messages/customers
 * Get active customers list for message recipient dropdown
 */
const getCustomers = async (req, res, next) => {
  try {
    const customers = await adminMessagesModel.getCustomersForMessaging();
    return res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully for messaging',
      data: customers,
    });
  } catch (error) {
    logger.error('[Admin Messages Controller] Error getting customers for messaging:', error);
    next(error);
  }
};

/**
 * GET /api/v1/admin/messages/:messageId
 */
const getMessageById = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const result = await adminMessagesModel.getAdminMessageById(messageId);

    if (!result || !result.message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message details and thread retrieved successfully',
      data: result.message,
      thread: result.thread,
    });
  } catch (error) {
    logger.error('[Admin Messages Controller] Error getting message details:', error);
    next(error);
  }
};

/**
 * POST /api/v1/admin/messages
 * Super Admin sends message to customer or replies
 */
const sendMessage = async (req, res, next) => {
  try {
    const adminUserId = req.user.user_id;
    const { customerId, department, subject, body, replyToMessageId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer recipient is required',
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required',
      });
    }

    if (!body || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message body is required',
      });
    }

    const created = await adminMessagesModel.sendAdminMessage({
      customerId: parseInt(customerId, 10),
      department: department || 'PPC-MGMT',
      subject: subject.trim(),
      body: body.trim(),
      replyToMessageId: replyToMessageId || null,
      adminUserId,
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent to customer successfully',
      data: created,
    });
  } catch (error) {
    logger.error('[Admin Messages Controller] Error sending message:', error);
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/messages/:messageId/read
 */
const markMessageAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const updated = await adminMessagesModel.markAdminMessageAsRead(messageId);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message marked as read by admin',
      data: updated,
    });
  } catch (error) {
    logger.error('[Admin Messages Controller] Error marking message as read:', error);
    next(error);
  }
};

module.exports = {
  getMessages,
  getCustomers,
  getMessageById,
  sendMessage,
  markMessageAsRead,
};
