const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { auth, authorize } = require('../middlewares/auth');
const { depositValidation, withdrawValidation } = require('../middlewares/validation');
const { ROLES } = require('../config/constants');

router.use(auth);
router.use(authorize(ROLES.STUDENT, ROLES.PARENT));

router.post('/deposit', depositValidation, feeController.deposit);
router.post('/withdraw', withdrawValidation, feeController.withdraw);
router.get('/balance', feeController.getBalance);
router.get('/balance/:childStudentId', feeController.getBalance);
router.get('/history', feeController.getHistory);
router.get('/history/:childStudentId', feeController.getHistory);

module.exports = router;
