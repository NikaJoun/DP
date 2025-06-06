const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const reportRoutes = require('./reportRoutes');
router.use('/reports', reportRoutes);

router.get('/users', authenticateToken, authorizeRole([1]), adminController.getUsers);
router.post('/update-role', authenticateToken, authorizeRole([1]), adminController.updateUserRole);

module.exports = router;