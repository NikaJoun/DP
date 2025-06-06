const db = require('../config/db');
const Notification = require('../models/notificationModel');

class CommentController {
  static async createComment(req, res) {
    const { postId } = req.params;
    const { liked, disliked, overall_impression, rating } = req.body;
    const userId = req.userId;
    
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        
        const [commentResult] = await connection.query(
            `INSERT INTO comments 
             (post_id, user_id, liked, disliked, overall_impression, rating) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [postId, userId, liked, disliked, overall_impression, rating]
        );
        
        const [post] = await connection.query(
            'SELECT user_id FROM posts WHERE id = ?',
            [postId]
        );
        
        if (post.length === 0) {
            throw new Error('Post not found');
        }
        
        const postAuthorId = post[0].user_id;
        
        if (postAuthorId !== userId) {
            await Notification.create(
                postAuthorId,
                userId,
                'comment',
                postId
            );
        }
        
        const [comments] = await connection.query(
            'SELECT rating FROM comments WHERE post_id = ?',
            [postId]
        );
        
        const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
        const averageRating = (totalRating / comments.length).toFixed(1);
        
        await connection.query(
            'UPDATE posts SET rating = ? WHERE id = ?',
            [averageRating, postId]
        );
        
        const [newComment] = await connection.query(
            `SELECT c.*, u.username 
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.id = ?`,
            [commentResult.insertId]
        );
        
        await connection.commit();
        
        res.status(201).json({ 
            success: true,
            data: {
                comment: newComment[0],
                averageRating
            }
        });
        
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('CommentController.createComment error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Internal server error' 
        });
    } finally {
        if (connection) connection.release();
    }
  }

  static async getCommentsForPost(req, res) {
    const { postId } = req.params;
    
    try {
      const [comments] = await db.query(
        `SELECT c.*, u.username 
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ?
         ORDER BY c.created_at DESC`,
        [postId]
      );
      
      res.json(comments);
    } catch (error) {
      console.error('Ошибка при получении комментариев:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
}

module.exports = CommentController;