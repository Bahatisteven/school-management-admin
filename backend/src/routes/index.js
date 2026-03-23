const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/fees', require('./feeRoutes'));
router.use('/academic', require('./academicRoutes'));
router.use('/students', require('./studentRoutes'));
router.use('/notifications', require('./notificationRoutes'));

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
