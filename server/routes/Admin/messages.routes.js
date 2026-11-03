const express = require('express');
const router = express.Router();
const messagesController = require('../../controller/Admin/messages.controller');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

/**
 * GET /api/v1/admin/messages
 * Retrieve messages with folder, department, search, and customer filters
 */
router.get('/', authenticate, authorize('admin'), messagesController.getMessages);

/**
 * GET /api/v1/admin/messages/customers
 * Retrieve active customer list for recipient dropdown
 */
router.get('/customers', authenticate, authorize('admin'), messagesController.getCustomers);

/**
 * GET /api/v1/admin/messages/:messageId
 * Retrieve single message details + customer thread
 */
router.get('/:messageId', authenticate, authorize('admin'), messagesController.getMessageById);

/**
 * POST /api/v1/admin/messages
 * Send message / reply to a customer
 */
router.post('/', authenticate, authorize('admin'), messagesController.sendMessage);

/**
 * PATCH /api/v1/admin/messages/:messageId/read
 * Mark message as read
 */
router.patch('/:messageId/read', authenticate, authorize('admin'), messagesController.markMessageAsRead);

module.exports = router;
