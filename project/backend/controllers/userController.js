const db = require('../config/db');
const Notification = require('../models/notificationModel');


class UserController {
  static async getUserInfo(req, res) {
      const userId = req.userId;
      
      try {
          const [user] = await db.query(
              'SELECT id, username, phone, role_id, about, avatar FROM users WHERE id = ?',
              [userId]
          );
          
          if (!user.length) {
              return res.status(404).json({ error: 'Пользователь не найден' });
          }
          
          res.json(user[0]);
      } catch (error) {
          console.error('Ошибка при получении информации о пользователе:', error);
          res.status(500).json({ error: 'Ошибка сервера' });
      }
  }

  static async updateUserInfo(req, res) {
    const { username, phone, about } = req.body;
    const userId = req.userId;
    
    try {
      await db.query(
        'UPDATE users SET username = ?, phone = ?, about = ? WHERE id = ?',
        [username, phone, about, userId]
      );
      
      res.json({ message: 'Данные профиля обновлены' });
    } catch (error) {
      console.error('Ошибка при обновлении данных пользователя:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Пользователь с таким телефоном уже существует' });
      }
      
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  static async getFollowers(req, res) {
    const userId = req.params.id;
    
    try {
      const [followers] = await db.query(
        `SELECT u.id, u.username, u.avatar, u.about 
         FROM subscriptions s
         JOIN users u ON s.follower_id = u.id
         WHERE s.user_id = ?`,
        [userId]
      );
      
      res.json(followers);
    } catch (error) {
      console.error('Ошибка при получении подписчиков:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  static async getSubscriptions(req, res) {
      const userId = req.params.id;
      
      try {
        const [subscriptions] = await db.query(
          `SELECT u.id, u.username, u.avatar, u.about 
          FROM subscriptions s
          JOIN users u ON s.user_id = u.id
          WHERE s.follower_id = ?`,
          [userId]
        );
        
        res.json(subscriptions);
      } catch (error) {
        console.error('Ошибка при получении подписок:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
      }
  }

  static async subscribe(req, res) {
    try {
      const userId = req.params.id;
      const followerId = req.userId;

              const [user] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (!user.length) {
            return res.status(404).json({ 
                success: false,
                error: 'Пользователь не найден' 
            });
        }
      
      if (userId == followerId) {
        return res.status(400).json({ 
          success: false,
          error: 'Нельзя подписаться на самого себя' 
        });
      }
      
      const [existing] = await db.query(
        'SELECT id FROM subscriptions WHERE user_id = ? AND follower_id = ?',
        [userId, followerId]
      );
      
      if (existing.length) {
        return res.status(400).json({ 
          success: false,
          error: 'Вы уже подписаны на этого пользователя' 
        });
      }
      
      await db.query(
        'INSERT INTO subscriptions (user_id, follower_id) VALUES (?, ?)',
        [userId, followerId]
      );

      await Notification.create(userId, followerId, 'subscription');
      
      return res.json({ 
        success: true,
        message: 'Подписка оформлена' 
      });
    } catch (error) {
      console.error('Ошибка подписки:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Ошибка сервера при подписке' 
      });
    }
  }

  static async unsubscribe(req, res) {
    const userId = req.params.id;
    const followerId = req.userId;

    try {
      const [result] = await db.query(
        'DELETE FROM subscriptions WHERE user_id = ? AND follower_id = ?',
        [userId, followerId]
      );

      if (result.affectedRows === 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Подписка не найдена' 
        });
      }

      return res.json({ 
        success: true,
        message: 'Отписались успешно' 
      });
    } catch (error) {
      console.error('Ошибка отписки:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Ошибка сервера' 
      });
    }
  }

  static async checkSubscription(req, res) {
    const userId = req.params.id;
    const followerId = req.userId;
    
    try {
      const [subscription] = await db.query(
        'SELECT id FROM subscriptions WHERE user_id = ? AND follower_id = ?',
        [userId, followerId]
      );
      
      res.json({ isSubscribed: subscription.length > 0 });
    } catch (error) {
      console.error('Ошибка при проверке подписки:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  static async getUserStats(req, res) {
    const userId = req.userId;
    
    try {
      const [followers] = await db.query(
        'SELECT COUNT(*) AS count FROM subscriptions WHERE user_id = ?',
        [userId]
      );
      
      const [subscriptions] = await db.query(
        'SELECT COUNT(*) AS count FROM subscriptions WHERE follower_id = ?',
        [userId]
      );
      
      res.json({
        followers: followers[0].count,
        subscriptions: subscriptions[0].count
      });
    } catch (error) {
      console.error('Ошибка при получении статистики:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  static async getNewAuthors(req, res) {
    try {
        const [authors] = await db.query(
            `SELECT id, username 
             FROM users 
             ORDER BY created_at DESC 
             LIMIT 5`
        );
        res.json(authors);
    } catch (error) {
        console.error('Ошибка при получении новых авторов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
  }

  static async getPublicUserInfo(req, res) {
    const userId = req.params.id;
    
    try {
      const [userRows] = await db.query(
        'SELECT id, username, avatar, about, created_at FROM users WHERE id = ?',
        [userId]
      );
      
      if (userRows.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      
      const user = userRows[0];

      const [followersRows] = await db.query(
        'SELECT COUNT(*) as count FROM subscriptions WHERE user_id = ?',
        [userId]
      );
      const followersCount = followersRows[0].count;

      const [subscriptionsRows] = await db.query(
        'SELECT COUNT(*) as count FROM subscriptions WHERE follower_id = ?',
        [userId]
      );
      const subscriptionsCount = subscriptionsRows[0].count;

      const [postsRows] = await db.query(`
        SELECT 
          p.id, p.title, p.views, p.rating, p.task_id,
          t.title AS task_title, t.task_number,
          e.title AS event_title, e.id AS event_id
        FROM posts p
        LEFT JOIN tasks t ON p.task_id = t.id
        LEFT JOIN events e ON t.event_id = e.id
        WHERE p.user_id = ? AND p.status = "published"
        ORDER BY p.created_at DESC
      `, [userId]);
      
      res.json({
        ...user,
        followersCount,
        subscriptionsCount,
        posts: postsRows || []
      });
      
    } catch (error) {
      console.error('Ошибка при получении публичной информации:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
}

module.exports = UserController;
