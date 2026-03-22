const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, authorize } = require('../middlewares/auth');
const { registerValidation, loginValidation } = require('../middlewares/validation');
const { ROLES } = require('../config/constants');

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getCurrentUser);

router.post(
  '/verify-device',
  auth,
  authorize(ROLES.ADMIN),
  authController.verifyDevice
);

router.get(
  '/pending-verifications',
  auth,
  authorize(ROLES.ADMIN),
  authController.getPendingVerifications
);

module.exports = router;
