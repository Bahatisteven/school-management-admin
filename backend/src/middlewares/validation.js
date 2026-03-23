const { body, param, query, validationResult } = require('express-validator');
const {
  ROLES,
  EXAM_TYPES,
  ATTENDANCE_STATUS,
  AMOUNT_LIMITS,
  PAGINATION,
} = require('../config/constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and number'),
  body('firstName').trim().notEmpty().isLength({ min: 2, max: 50 }).withMessage('First name is required (2-50 chars)'),
  body('lastName').trim().notEmpty().isLength({ min: 2, max: 50 }).withMessage('Last name is required (2-50 chars)'),
  body('role').isIn([ROLES.STUDENT, ROLES.PARENT]).withMessage('Invalid role'),
  body('phoneNumber').optional().trim().matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  validate,
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('deviceId').notEmpty().trim().isLength({ min: 5, max: 100 }).withMessage('Valid device ID is required'),
  body('deviceName').optional().trim().isLength({ max: 100 }),
  validate,
];

const depositValidation = [
  body('amount')
    .isFloat({ min: AMOUNT_LIMITS.MIN, max: AMOUNT_LIMITS.MAX })
    .withMessage(`Amount must be between ${AMOUNT_LIMITS.MIN} and ${AMOUNT_LIMITS.MAX} RWF`),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  body('childStudentId').optional().isMongoId().withMessage('Invalid student ID'),
  validate,
];

const withdrawValidation = [
  body('amount')
    .isFloat({ min: AMOUNT_LIMITS.MIN, max: AMOUNT_LIMITS.MAX })
    .withMessage(`Amount must be between ${AMOUNT_LIMITS.MIN} and ${AMOUNT_LIMITS.MAX} RWF`),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  body('childStudentId').optional().isMongoId().withMessage('Invalid student ID'),
  validate,
];

const gradeValidation = [
  body('studentId').isMongoId().withMessage('Valid student ID is required'),
  body('classId').isMongoId().withMessage('Valid class ID is required'),
  body('subject').trim().notEmpty().isLength({ min: 2, max: 100 }).withMessage('Subject is required'),
  body('score').isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('examType').isIn(Object.values(EXAM_TYPES)).withMessage('Invalid exam type'),
  body('term').isIn(['1', '2', '3']).withMessage('Invalid term'),
  body('academicYear').isInt({ min: 2000, max: 2100 }).withMessage('Invalid academic year'),
  body('remarks').optional().trim().isLength({ max: 500 }),
  validate,
];

const attendanceValidation = [
  body('studentId').isMongoId().withMessage('Valid student ID is required'),
  body('classId').isMongoId().withMessage('Valid class ID is required'),
  body('status').isIn(Object.values(ATTENDANCE_STATUS)).withMessage('Invalid status'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('remarks').optional().trim().isLength({ max: 500 }),
  validate,
];

const createClassValidation = [
  body('name').trim().notEmpty().isLength({ min: 2, max: 100 }).withMessage('Class name is required (2-100 chars)'),
  body('grade').trim().notEmpty().isLength({ min: 1, max: 50 }).withMessage('Grade is required'),
  body('section').optional().trim().isLength({ max: 50 }),
  body('academicYear').trim().notEmpty().matches(/^\d{4}(-\d{4})?$/).withMessage('Academic year format: YYYY or YYYY-YYYY'),
  body('capacity').optional().isInt({ min: 1, max: 200 }).withMessage('Capacity must be between 1 and 200'),
  body('teacherId').optional().isMongoId().withMessage('Invalid teacher ID'),
  validate,
];

const updateClassValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('grade').optional().trim().isLength({ min: 1, max: 50 }),
  body('section').optional().trim().isLength({ max: 50 }),
  body('academicYear').optional().trim().matches(/^\d{4}(-\d{4})?$/),
  body('capacity').optional().isInt({ min: 1, max: 200 }),
  body('teacherId').optional().isMongoId(),
  validate,
];

const assignTeacherValidation = [
  body('teacherId').isMongoId().withMessage('Valid teacher ID is required'),
  body('classId').isMongoId().withMessage('Valid class ID is required'),
  validate,
];

const verifyDeviceValidation = [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('deviceId').trim().notEmpty().isLength({ min: 5, max: 100 }).withMessage('Valid device ID is required'),
  validate,
];

const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phoneNumber').optional().trim().matches(/^\+?[1-9]\d{1,14}$/),
  body('email').optional().isEmail().normalizeEmail(),
  validate,
];

const dateRangeValidation = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  validate,
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate,
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: PAGINATION.MAX_LIMIT }).withMessage(`Limit must be between 1 and ${PAGINATION.MAX_LIMIT}`),
  validate,
];

module.exports = {
  registerValidation,
  loginValidation,
  depositValidation,
  withdrawValidation,
  gradeValidation,
  attendanceValidation,
  createClassValidation,
  updateClassValidation,
  assignTeacherValidation,
  verifyDeviceValidation,
  updateProfileValidation,
  dateRangeValidation,
  idValidation,
  paginationValidation,
  validate,
};
