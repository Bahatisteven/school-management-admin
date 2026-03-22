const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

router.use(auth);
router.use(authorize(ROLES.ADMIN));

router.get('/dashboard', adminController.getDashboard);
router.get('/students', adminController.getStudents);
router.get('/teachers', adminController.getTeachers);
router.get('/classes', adminController.getClasses);
router.post('/classes', adminController.createClass);
router.put('/classes/:id', adminController.updateClass);
router.delete('/classes/:id', adminController.deleteClass);
router.post('/assign-teacher', adminController.assignTeacher);
router.get('/fee-transactions', adminController.getFeeTransactions);
router.get('/attendance-report', adminController.getAttendanceReport);
router.get('/pending-verifications', adminController.getPendingVerifications);
router.post('/verify-device', adminController.verifyDevice);

module.exports = router;
