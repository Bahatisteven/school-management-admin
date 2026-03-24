const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'payment_confirmed',
      'refund_processed',
      'low_balance',
      'device_verified',
      'login_success',
      'grade_added',
      'attendance_marked',
    ],
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: mongoose.Schema.Types.Mixed,
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: Date,
}, {
  timestamps: true,
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
