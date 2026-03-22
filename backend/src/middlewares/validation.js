const { body, validationResult } = require('express-validator');

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
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('role').isIn(['student', 'parent']).withMessage('Invalid role'),
  body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
  validate,
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('deviceId').notEmpty().withMessage('Device ID is required'),
  body('deviceName').optional().trim(),
  validate,
];

const depositValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().trim(),
  validate,
];

const withdrawValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().trim(),
  validate,
];

module.exports = {
  registerValidation,
  loginValidation,
  depositValidation,
  withdrawValidation,
  validate,
};
