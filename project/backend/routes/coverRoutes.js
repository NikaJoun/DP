const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/coverMiddleware');
const CoverController = require('../controllers/coverController');

router.post('/cover/upload', authenticateToken, upload, CoverController.uploadCover);
router.delete('/cover/:filename', authenticateToken, CoverController.deleteCover);

module.exports = router;