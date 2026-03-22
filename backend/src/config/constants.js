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
  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
    EXCUSED: 'excused',
  },
  TOKEN_EXPIRY: '24h',
  PASSWORD_HASH_ROUNDS: 12,
};
