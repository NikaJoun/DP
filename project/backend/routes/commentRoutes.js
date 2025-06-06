const express = require('express');
const { createComment, getCommentsForPost } = require('../controllers/commentController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/posts/:postId/comments', authenticateToken, createComment);
router.get('/posts/:postId/comments', getCommentsForPost);

module.exports = router;