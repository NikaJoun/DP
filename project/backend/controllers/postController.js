const db = require('../config/db');
const Post = require('../models/postModel');

class PostController {
   static async createPost(req, res) {
    const { title, content, status, coverImage, taskId } = req.body;
    const userId = req.userId;
    
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      
      const [postResult] = await connection.query(
        'INSERT INTO posts (user_id, title, content, status, cover_image, task_id) VALUES (?, ?, ?, ?, ?, ?)',
        [
          userId, 
          title, 
          content, 
          status || 'draft',
          coverImage || null,
          taskId || null 
        ]
      );
      
      await connection.commit();
      res.status(201).json({ 
        message: status === 'published' 
          ? 'Публикация опубликована' 
          : 'Публикация сохранена как черновик',
        postId: postResult.insertId
      });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Ошибка при создании публикации:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    } finally {
      if (connection) connection.release();
    }
}

static async updatePost(req, res) {
    const postId = req.params.id;
    const { title, content, status, coverImage, taskId } = req.body;
    const userId = req.userId;
    
    try {
      const [post] = await db.query(
        'SELECT user_id FROM posts WHERE id = ?',
        [postId]
      );
      
      if (!post.length) {
        return res.status(404).json({ error: 'Публикация не найдена' });
      }
      
      if (post[0].user_id !== userId) {
        return res.status(403).json({ error: 'Нет прав на редактирование' });
      }
      
      await db.query(
        'UPDATE posts SET title = ?, content = ?, status = ?, cover_image = ?, task_id = ? WHERE id = ?',
        [title, content, status, coverImage || null, taskId || null, postId] // Добавлено taskId
      );
      
      res.json({ 
        message: 'Публикация обновлена',
        postId: postId
      });
    } catch (error) {
      console.error('Ошибка при обновлении публикации:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
}

  static async getAllPosts(req, res) {
    try {
      const filterParams = {
        query: req.query.query || '',
        sort: req.query.sort || 'newest',
        period: req.query.period || '',
        page: req.query.page || 1,
        limit: req.query.limit || 12
      };

      const result = await Post.getAll(filterParams);
      
      res.json({
        posts: result.posts,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Ошибка при получении публикаций:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  static async getPostById(req, res) {
    const postId = req.params.id;
    
    try {
      const [post] = await db.query(
        `SELECT p.id, p.title, p.content, p.rating, p.status,
         p.user_id, u.username
         FROM posts p 
         JOIN users u ON p.user_id = u.id 
         WHERE p.id = ?`,
        [postId]
      );
      
      if (!post.length) {
        return res.status(404).json({ error: 'Публикация не найдена' });
      }
      
      res.json(post[0]);
    } catch (error) {
      console.error('Ошибка при получении публикации:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  static async getUserPosts(req, res) {
      const userId = req.userId;
      
      try {
        const posts = await Post.getByUserId(userId);
        res.json(posts);
      } catch (error) {
        console.error('Ошибка при получении публикаций пользователя:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
      }
  }

  static async deletePost(req, res) {
    const postId = req.params.id;
    const userId = req.userId;
    
    try {
      const [post] = await db.query(
        'SELECT user_id FROM posts WHERE id = ?',
        [postId]
      );
      
      if (!post.length) {
        return res.status(404).json({ error: 'Публикация не найдена' });
      }
      
      if (post[0].user_id !== userId) {
        return res.status(403).json({ error: 'Нет прав на удаление' });
      }
      
      await db.query(
        'DELETE FROM posts WHERE id = ?',
        [postId]
      );
      
      res.json({ message: 'Публикация удалена' });
    } catch (error) {
      console.error('Ошибка при удалении публикации:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  static async incrementPostViews(req, res) {
    const postId = req.params.id;
    
    try {
      const [result] = await db.query(
        'UPDATE posts SET views = views + 1 WHERE id = ?',
        [postId]
      );
      
      const [post] = await db.query(
        'SELECT views FROM posts WHERE id = ?',
        [postId]
      );
      
      res.json({ 
        success: true,
        views: post[0].views 
      });
    } catch (error) {
      console.error('Ошибка при обновлении просмотров:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  static async getPopularPosts(req, res) {
    try {
      const [posts] = await db.query(`
        SELECT p.id, p.title, 
               LEFT(p.content, 100) as preview,
               p.rating, p.views, 
               u.username
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.status = 'published'
        ORDER BY p.views DESC, p.rating DESC
        LIMIT 5
      `);
      res.json(posts || []);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async getPostsByTaskId(req, res) {
    try {
      const taskId = req.params.taskId;
      const posts = await Post.getByTaskId(taskId);
      res.json(posts);
    } catch (error) {
      console.error('Ошибка при получении публикаций по заданию:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
}

module.exports = PostController;