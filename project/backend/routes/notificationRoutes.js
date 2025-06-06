const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const authenticateToken = require('../middleware/authMiddleware');
const adminCheck = require('../middleware/roleMiddleware');

router.get('/', authenticateToken, NotificationController.getUserNotifications);
router.get('/unread-count', authenticateToken, NotificationController.getUnreadCount);
router.get('/check-new', authenticateToken, NotificationController.checkNewNotifications);
router.put('/:notificationId/read', authenticateToken, NotificationController.markAsRead);
router.put('/mark-all-read', authenticateToken, NotificationController.markAllAsRead);

router.delete('/clean-old', authenticateToken, adminCheck, NotificationController.cleanOldNotifications);

module.exports = router;