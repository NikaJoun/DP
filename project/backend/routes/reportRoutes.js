const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const ReportController = require('../controllers/reportController');

router.get('/users', authenticateToken, authorizeRole([1]), ReportController.generateUserReports);
router.get('/posts', authenticateToken, authorizeRole([1]), ReportController.generatePostReports);
router.get('/export/:type/:format', authenticateToken, authorizeRole([1]), ReportController.exportReport);

module.exports = router;