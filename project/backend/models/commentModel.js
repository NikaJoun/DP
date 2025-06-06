const db = require('../config/db');

class Comment {
  static async create(postId, userId, liked, disliked, overallImpression, rating) {
    const query = `
      INSERT INTO comments 
      (post_id, user_id, liked, disliked, overall_impression, rating) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [postId, userId, liked, disliked, overallImpression, rating]);
    return result;
  }

  static async getByPostId(postId) {
    const query = `
      SELECT 
        comments.id, 
        comments.liked, 
        comments.disliked, 
        comments.overall_impression, 
        comments.rating, 
        users.username 
      FROM comments 
      JOIN users ON comments.user_id = users.id 
      WHERE comments.post_id = ?
    `;
    const [rows] = await db.query(query, [postId]);
    return rows;
  }

  static async updatePostRating(postId, newRating) {
    const query = 'UPDATE posts SET rating = ? WHERE id = ?';
    const [result] = await db.query(query, [newRating, postId]);
    return result;
  }
}

module.exports = Comment;
