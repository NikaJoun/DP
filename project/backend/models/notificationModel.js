const db = require('../config/db');

class Notification {
  static async create(userId, senderId, type, postId = null) {
    const query = `
      INSERT INTO notifications 
      (user_id, sender_id, type, post_id) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [userId, senderId, type, postId]);
    return result.insertId;
  }

  static async getByUserId(userId, options = {}) {
    const {
      limit = 20,
      offset = 0,
      unreadOnly = false,
      includeDetails = true
    } = options;

    let query = `
      SELECT 
        n.id,
        n.type,
        n.is_read,
        n.created_at,
        n.post_id
    `;

    if (includeDetails) {
      query += `,
        u.id as sender_id,
        u.username as sender_username,
        u.avatar as sender_avatar,
        p.title as post_title
      `;
    }

    query += `
      FROM notifications n
    `;

    if (includeDetails) {
      query += `
        LEFT JOIN users u ON n.sender_id = u.id
        LEFT JOIN posts p ON n.post_id = p.id
      `;
    }

    query += `
      WHERE n.user_id = ?
    `;

    if (unreadOnly) {
      query += ` AND n.is_read = FALSE`;
    }

    query += `
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [results] = await db.query(query, [userId, limit, offset]);
    return results;
  }

  static async markAsRead(notificationId, userId) {
    const query = `
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE id = ? AND user_id = ?
    `;
    const [result] = await db.query(query, [notificationId, userId]);
    return result.affectedRows;
  }

  static async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? AND is_read = FALSE
    `;
    const [results] = await db.query(query, [userId]);
    return results[0].count;
  }

  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE user_id = ? AND is_read = FALSE
    `;
    const [result] = await db.query(query, [userId]);
    return result.affectedRows;
  }

  static async deleteOldNotifications(days = 30) {
    const query = `
      DELETE FROM notifications 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    const [result] = await db.query(query, [days]);
    return result.affectedRows;
  }

  static async checkNewNotifications(userId, lastChecked) {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM notifications 
        WHERE user_id = ? 
        AND created_at > ?
        AND is_read = FALSE
      ) as has_new
    `;
    const [results] = await db.query(query, [userId, lastChecked]);
    return Boolean(results[0].has_new);
  }
}

module.exports = Notification;