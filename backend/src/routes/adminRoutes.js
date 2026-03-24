const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middlewares/auth');
const { 
  createClassValidation, 
  updateClassValidation, 
  createTeacherValidation,
  assignTeacherValidation,
  assignStudentValidation,
  verifyDeviceValidation,
  dateRangeValidation,
  idValidation,
  paginationValidation,
} = require('../middlewares/validation');
const { ROLES } = require('../config/constants');

router.use(auth);

router.get('/dashboard', authorize(ROLES.ADMIN, ROLES.TEACHER), adminController.getDashboard);
router.get('/students', authorize(ROLES.ADMIN, ROLES.TEACHER), paginationValidation, adminController.getStudents);
router.get('/classes', authorize(ROLES.ADMIN, ROLES.TEACHER), adminController.getClasses);
router.get('/teachers', authorize(ROLES.ADMIN, ROLES.TEACHER), paginationValidation, adminController.getTeachers);

// admin routes
router.post('/teachers', authorize(ROLES.ADMIN), createTeacherValidation, adminController.createTeacher);
router.post('/classes', authorize(ROLES.ADMIN), createClassValidation, adminController.createClass);
router.put('/classes/:id', authorize(ROLES.ADMIN), idValidation, updateClassValidation, adminController.updateClass);
router.delete('/classes/:id', authorize(ROLES.ADMIN), idValidation, adminController.deleteClass);
router.post('/assign-teacher', authorize(ROLES.ADMIN), assignTeacherValidation, adminController.assignTeacher);
router.post('/assign-student', authorize(ROLES.ADMIN), assignStudentValidation, adminController.assignStudent);
router.get('/fee-transactions', authorize(ROLES.ADMIN), paginationValidation, adminController.getFeeTransactions);
router.get('/pending-verifications', authorize(ROLES.ADMIN), adminController.getPendingVerifications);
router.post('/verify-device', authorize(ROLES.ADMIN), verifyDeviceValidation, adminController.verifyDevice);


router.get('/attendance-report', authorize(ROLES.ADMIN, ROLES.TEACHER), dateRangeValidation, adminController.getAttendanceReport);

module.exports = router;
