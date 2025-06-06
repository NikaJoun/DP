const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const AvatarController = require('../controllers/avatarController');

router.post('/avatar/upload', authenticateToken, upload.single('avatar'), AvatarController.uploadAvatar);

router.delete('/avatar/delete', authenticateToken, AvatarController.deleteAvatar);

module.exports = router;