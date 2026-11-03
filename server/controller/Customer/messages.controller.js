const messagesModel = require('../../models/Customer/messages.model');
const { notifyAdmins } = require('../../services/notification.service');
const logger = require('../../utils/logger');

/**
 * GET /api/v1/customer/messages
 * Query params: ?folder=inbox|outbox & search=...
 */
const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { folder, search } = req.query;

    const result = await messagesModel.getCustomerMessages(userId, { folder, search });

    return res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: result.messages,
      meta: result.meta,
    });
  } catch (error) {
    logger.error('[Messages Controller] Error getting messages:', error);
    next(error);
  }
};

/**
 * GET /api/v1/customer/messages/:messageId
 */
const getMessageById = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { messageId } = req.params;

    const message = await messagesModel.getCustomerMessageById(userId, messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message details retrieved successfully',
      data: message,
    });
  } catch (error) {
    logger.error('[Messages Controller] Error getting message details:', error);
    next(error);
  }
};

/**
 * POST /api/v1/customer/messages
 * Body: { to, subject, body, replyToMessageId }
 */
const createMessage = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { to, subject, body, replyToMessageId } = req.body;

    if (!to || !to.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Recipient is required',
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

    const result = await messagesModel.createCustomerMessage(userId, {
      to: to.trim(),
      subject: subject.trim(),
      body: body.trim(),
      replyToMessageId: replyToMessageId || null,
    });

    // Notify admins of new customer message
    notifyAdmins({
      actorId: userId,
      title: `New Message: ${subject.trim()}`,
      message: `A customer has sent a message to ${to.trim()}: "${subject.trim()}"`,
      type: 'message',
      linkUrl: '/admin/messages',
    }).catch((err) => {
      logger.warn('[Messages Controller] Admin notification failed:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: result.sentMessage,
    });
  } catch (error) {
    logger.error('[Messages Controller] Error creating message:', error);
    next(error);
  }
};

/**
 * PATCH /api/v1/customer/messages/:messageId/read
 */
const markMessageAsRead = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { messageId } = req.params;

    const updated = await messagesModel.markCustomerMessageAsRead(userId, messageId);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or already read',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: updated,
    });
  } catch (error) {
    logger.error('[Messages Controller] Error marking message as read:', error);
    next(error);
  }
};

module.exports = {
  getMessages,
  getMessageById,
  createMessage,
  markMessageAsRead,
};
