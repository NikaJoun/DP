const db = require('../config/db');

class Post {
  static async create(userId, title, content, status, taskId = null, coverImage = null) {
    const query = `
      INSERT INTO posts 
      (user_id, title, content, status, task_id, cover_image) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [
      userId, 
      title, 
      content, 
      status, 
      taskId || null,
      coverImage
    ]);
    return result;
  }

  static async update(postId, userId, title, content, status, taskId = null, coverImage = null) {
      const query = `
        UPDATE posts 
        SET title = ?, content = ?, status = ?, task_id = ?, cover_image = ?
        WHERE id = ? AND user_id = ?
      `;
      const [result] = await db.query(query, 
        [title, content, status, taskId, coverImage, postId, userId]
      );
      return result;
}

  static async getByTaskId(taskId) {
    const query = `
      SELECT 
        p.*,
        u.username
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.task_id = ?
    `;
    const [rows] = await db.query(query, [taskId]);
    return rows;
  }

  static async getAll(filterParams = {}) {
    const {
      query = '',
      sort = 'newest',
      period = '',
      page = 1,
      limit = 12
    } = filterParams;
    
    let sql = `
      SELECT 
        p.id, p.title, p.content, p.status, p.rating,
        p.cover_image, p.created_at, p.views, p.task_id,
        u.username, u.id as userId,
        t.title as task_title, t.task_number,
        e.title as event_title
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      LEFT JOIN tasks t ON p.task_id = t.id
      LEFT JOIN events e ON t.event_id = e.id
      WHERE p.status IN ('published')
    `;
    
    const params = [];
    
    if (query) {
      sql += ' AND p.title LIKE ?';
      params.push(`%${query}%`);
    }
    
    if (period) {
      let dateCondition = '';
      switch (period) {
        case 'today':
          dateCondition = 'DATE(p.created_at) = CURRENT_DATE()';
          break;
        case 'week':
          dateCondition = 'p.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)';
          break;
        case 'month':
          dateCondition = 'p.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)';
          break;
        case 'year':
          dateCondition = 'p.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)';
          break;
      }
      if (dateCondition) {
        sql += ` AND ${dateCondition}`;
      }
    }
    
    switch (sort) {
      case 'oldest':
        sql += ' ORDER BY p.created_at ASC';
        break;
      case 'popular':
        sql += ' ORDER BY p.views DESC, p.rating DESC';
        break;
      case 'rating':
        sql += ' ORDER BY p.rating DESC';
        break;
      default:
        sql += ' ORDER BY p.created_at DESC';
    }
    
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [posts] = await db.query(sql, params);
    
    let countSql = `
      SELECT COUNT(*) as total 
      FROM posts p 
      WHERE p.status IN ('published')
    `;
    if (query) {
      countSql += ' AND p.title LIKE ?';
    }
    if (period) {
      let dateCondition = '';
      switch (period) {
        case 'today':
          dateCondition = 'DATE(p.created_at) = CURRENT_DATE()';
          break;
        case 'week':
          dateCondition = 'p.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)';
          break;
        case 'month':
          dateCondition = 'p.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)';
          break;
        case 'year':
          dateCondition = 'p.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)';
          break;
      }
      if (dateCondition) {
        countSql += ` AND ${dateCondition}`;
      }
    }
    
    const [total] = await db.query(countSql, query ? [`%${query}%`] : []);
    const totalPosts = total[0].total;
    const totalPages = Math.ceil(totalPosts / limit);
    
    return {
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPosts,
        itemsPerPage: parseInt(limit)
      }
    };
  }

  static async getById(postId) {
    const query = `
      SELECT posts.*, users.username, tasks.title as task_title 
      FROM posts 
      JOIN users ON posts.user_id = users.id
      LEFT JOIN tasks ON posts.task_id = tasks.id
      WHERE posts.id = ?
    `;
    const [rows] = await db.query(query, [postId]);
    return rows[0];
  }

  static async getByUserId(userId) {
    const query = `
      SELECT 
        p.*,
        u.username,
        t.title AS task_title,
        t.task_number,
        e.title AS event_title
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN tasks t ON p.task_id = t.id
      LEFT JOIN events e ON t.event_id = e.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `;
    const [rows] = await db.query(query, [userId]);
    return rows;
  }

  static async delete(postId, userId) {
    const query = 'DELETE FROM posts WHERE id = ? AND user_id = ?';
    const [result] = await db.query(query, [postId, userId]);
    return result;
  }

  static async updatePostRating(postId, newRating) {
    const query = 'UPDATE posts SET rating = ? WHERE id = ?';
    const [result] = await db.query(query, [newRating, postId]);
    return result;
  }

  static async incrementViews(postId) {
    const query = 'UPDATE posts SET views = views + 1 WHERE id = ?';
    const [result] = await db.query(query, [postId]);
    return result;
  }

  static async getPopularPosts(limit = 5) {
    const query = `
      SELECT posts.id, posts.title, posts.content, posts.rating, posts.views, users.username 
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      WHERE posts.status = 'published' 
      ORDER BY posts.rating DESC 
      LIMIT ?
    `;
    const [rows] = await db.query(query, [limit]);
    return rows;
  }  
  
  static async removeCoverReference(filename) {
    const query = 'UPDATE posts SET cover_image = NULL WHERE cover_image LIKE ?';
    await db.query(query, [`%/uploads/covers/${filename}`]);
  }
}

module.exports = Post;