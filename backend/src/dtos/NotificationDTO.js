class NotificationDTO {
  static toClient(notification) {
    return {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: notification.isRead,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }

  static toClientList(notifications) {
    return notifications.map(n => this.toClient(n));
  }
}

module.exports = NotificationDTO;
