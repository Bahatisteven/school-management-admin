const Notification = require('../models/Notification');
const NotificationDTO = require('../dtos/NotificationDTO');

class NotificationService {
  async create(userId, type, title, message, data = null) {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
    });

    await notification.save();
    return NotificationDTO.toClient(notification);
  }

  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
    const query = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return {
      notifications: NotificationDTO.toClientList(notifications),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found');
    }

    return NotificationDTO.toClient(notification);
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return { message: 'Notification deleted successfully' };
  }

  async notifyPaymentConfirmed(userId, amount, newBalance) {
    return this.create(
      userId,
      'payment_confirmation',
      'Payment Confirmed',
      `Your payment of RWF ${amount.toLocaleString()} has been confirmed. New balance: RWF ${newBalance.toLocaleString()}`,
      { amount, newBalance }
    );
  }

  async notifyRefundProcessed(userId, amount, newBalance) {
    return this.create(
      userId,
      'refund_status',
      'Refund Processed',
      `Your refund request of RWF ${amount.toLocaleString()} has been processed. New balance: RWF ${newBalance.toLocaleString()}`,
      { amount, newBalance }
    );
  }

  async notifyLowBalance(userId, balance, threshold = 50000) {
    return this.create(
      userId,
      'low_balance',
      'Low Balance Warning',
      `Your fee balance is low (RWF ${balance.toLocaleString()}). Please top up to avoid service interruption.`,
      { balance, threshold }
    );
  }

  async notifyDeviceVerified(userId, deviceName) {
    return this.create(
      userId,
      'device_verified',
      'Device Verified',
      `Your device "${deviceName}" has been verified by an administrator. You can now access the system.`,
      { deviceName }
    );
  }

  async notifySuccessfulLogin(userId, deviceName) {
    return this.create(
      userId,
      'login_success',
      'Successful Login',
      `Successful login from device "${deviceName}" at ${new Date().toLocaleString()}`,
      { deviceName, loginTime: new Date() }
    );
  }

  async notifyGradeAdded(userId, subject, score) {
    return this.create(
      userId,
      'grade_added',
      'New Grade Added',
      `A new grade has been added for ${subject}: ${score}/100`,
      { subject, score }
    );
  }

  async notifyAttendanceMarked(userId, date, status) {
    return this.create(
      userId,
      'attendance_marked',
      'Attendance Marked',
      `Your attendance for ${new Date(date).toLocaleDateString()} has been marked as: ${status}`,
      { date, status }
    );
  }
}

module.exports = new NotificationService();
