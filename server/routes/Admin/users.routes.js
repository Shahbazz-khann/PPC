const express = require('express');
const router = express.Router();

const {
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
} = require('../../controller/Admin/users.controller');
const {
  validateGetAdminUsers,
  validateUpdateAdminUser,
  validateDeleteAdminUser,
} = require('../../validators/Admin/users.validator');
const { authenticate, authorizePageAccess } = require('../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../config/adminPageRegistry');

router.get(
  '/',
  authenticate,
  authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_ADMIN_USERS),
  validateGetAdminUsers,
  getAdminUsers
);

router.put(
  '/:userId',
  authenticate,
  authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_ADMIN_USERS),
  validateUpdateAdminUser,
  updateAdminUser
);

router.delete(
  '/:userId',
  authenticate,
  authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_ADMIN_USERS),
  validateDeleteAdminUser,
  deleteAdminUser
);

module.exports = router;
