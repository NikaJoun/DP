const express = require('express');
const { createPost, getAllPosts, updatePost, deletePost, getPostById, getUserPosts, incrementPostViews, getPopularPosts, getPostsByTaskId} = require('../controllers/postController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/posts', authenticateToken, createPost);
router.get('/posts', getAllPosts);
router.get('/posts/task/:taskId', authenticateToken, getPostsByTaskId);
router.get('/posts/:id', getPostById);
router.put('/posts/:id', authenticateToken, updatePost);
router.delete('/posts/:id', authenticateToken, deletePost);
router.get('/user/user-posts', authenticateToken, getUserPosts);
router.patch('/posts/:id/views', incrementPostViews);
router.get('/popular', getPopularPosts);


module.exports = router;
