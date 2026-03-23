module.exports = {
  ROLES: {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
    PARENT: 'parent',
  },
  TRANSACTION_TYPES: {
    DEPOSIT: 'deposit',
    WITHDRAW: 'withdraw',
  },
  TRANSACTION_STATUS: {
    COMPLETED: 'completed',
    PENDING: 'pending',
    FAILED: 'failed',
  },
  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
    EXCUSED: 'excused',
  },
  EXAM_TYPES: {
    QUIZ: 'quiz',
    MIDTERM: 'midterm',
    FINAL: 'final',
    ASSIGNMENT: 'assignment',
  },
  NOTIFICATION_TYPES: {
    PAYMENT_CONFIRMED: 'payment_confirmed',
    REFUND_PROCESSED: 'refund_processed',
    LOW_BALANCE: 'low_balance',
    DEVICE_VERIFIED: 'device_verified',
    LOGIN_SUCCESS: 'login_success',
  },
  TOKEN_EXPIRY: '24h',
  PASSWORD_HASH_ROUNDS: 12,
  LOW_BALANCE_THRESHOLD: 50000,
  LOW_BALANCE_NOTIFICATION_COOLDOWN_DAYS: 7,
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    TRANSACTION_LIMIT: 50,
  },
  AMOUNT_LIMITS: {
    MIN: 100,
    MAX: 10000000,
  },
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
  },
};
