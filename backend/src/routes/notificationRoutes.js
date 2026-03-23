const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middlewares/auth');
const { paginationValidation, idValidation } = require('../middlewares/validation');

router.use(auth);

router.get('/', paginationValidation, notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.put('/:id/read', idValidation, notificationController.markAsRead);
router.delete('/:id', idValidation, notificationController.deleteNotification);

module.exports = router;
