const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { auth, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

router.use(auth);

router.get(
  '/profile',
  authorize(ROLES.STUDENT),
  studentController.getProfile
);

router.put(
  '/profile',
  authorize(ROLES.STUDENT),
  studentController.updateProfile
);

router.get(
  '/children',
  authorize(ROLES.PARENT),
  studentController.getChildren
);

module.exports = router;
