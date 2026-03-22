const { body, param, query, validationResult } = require('express-validator');

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
  body('role').isIn(['student', 'parent']).withMessage('Invalid role'),
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
    .isFloat({ min: 100, max: 10000000 })
    .withMessage('Amount must be between 100 and 10,000,000 RWF'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  body('childStudentId').optional().isMongoId().withMessage('Invalid student ID'),
  validate,
];

const withdrawValidation = [
  body('amount')
    .isFloat({ min: 100, max: 10000000 })
    .withMessage('Amount must be between 100 and 10,000,000 RWF'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
  body('childStudentId').optional().isMongoId().withMessage('Invalid student ID'),
  validate,
];

const gradeValidation = [
  body('studentId').isMongoId().withMessage('Valid student ID is required'),
  body('subject').trim().notEmpty().isLength({ min: 2, max: 100 }).withMessage('Subject is required'),
  body('score').isFloat({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('examType').isIn(['quiz', 'midterm', 'final', 'assignment']).withMessage('Invalid exam type'),
  body('term').isIn(['1', '2', '3']).withMessage('Invalid term'),
  body('academicYear').isInt({ min: 2000, max: 2100 }).withMessage('Invalid academic year'),
  validate,
];

const attendanceValidation = [
  body('studentId').isMongoId().withMessage('Valid student ID is required'),
  body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid status'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('remarks').optional().trim().isLength({ max: 500 }),
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

module.exports = {
  registerValidation,
  loginValidation,
  depositValidation,
  withdrawValidation,
  gradeValidation,
  attendanceValidation,
  updateProfileValidation,
  dateRangeValidation,
  idValidation,
  validate,
};
