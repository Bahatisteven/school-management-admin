const notificationService = require('../services/notificationService');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      
      const result = await notificationService.getUserNotifications(
        req.user._id,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          unreadOnly: unreadOnly === 'true',
        }
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await notificationService.markAsRead(id, req.user._id);

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user._id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;
      const result = await notificationService.deleteNotification(id, req.user._id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const result = await notificationService.getUserNotifications(
        req.user._id,
        { page: 1, limit: 1 }
      );

      res.json({
        success: true,
        data: { unreadCount: result.unreadCount },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
