const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middlewares/auth');
const { 
  createClassValidation, 
  updateClassValidation, 
  assignTeacherValidation,
  verifyDeviceValidation,
  dateRangeValidation,
  idValidation,
  paginationValidation,
} = require('../middlewares/validation');
const { ROLES } = require('../config/constants');

router.use(auth);
router.use(authorize(ROLES.ADMIN));

router.get('/dashboard', adminController.getDashboard);
router.get('/students', paginationValidation, adminController.getStudents);
router.get('/teachers', paginationValidation, adminController.getTeachers);
router.get('/classes', adminController.getClasses);
router.post('/classes', createClassValidation, adminController.createClass);
router.put('/classes/:id', idValidation, updateClassValidation, adminController.updateClass);
router.delete('/classes/:id', idValidation, adminController.deleteClass);
router.post('/assign-teacher', assignTeacherValidation, adminController.assignTeacher);
router.get('/fee-transactions', paginationValidation, adminController.getFeeTransactions);
router.get('/attendance-report', dateRangeValidation, adminController.getAttendanceReport);
router.get('/pending-verifications', adminController.getPendingVerifications);
router.post('/verify-device', verifyDeviceValidation, adminController.verifyDevice);

module.exports = router;
