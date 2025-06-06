const db = require('../config/db');

class User {
    static async getById(id) {
        const query = 'SELECT id, username, phone, role_id, avatar FROM users WHERE id = ?';
        const [results] = await db.query(query, [id]);
        return results[0];
    }

    static async getByPhone(phone) {
        const query = 'SELECT * FROM users WHERE phone = ?';
        const [results] = await db.query(query, [phone]);
        return results[0];
    }

    static async getByTelegramId(telegramId) {
        const query = 'SELECT * FROM users WHERE telegram_id = ?';
        const [results] = await db.query(query, [telegramId]);
        return results[0];
    }

    static async getAllUsers() {
        const query = `
            SELECT u.id, u.username, u.phone, r.name AS role
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
        `;
        const [results] = await db.query(query);
        return results;
    }

    static async create(username, phone, password, roleId) {
        const query = 'INSERT INTO users (username, phone, password, role_id) VALUES (?, ?, ?, ?)';
        const [results] = await db.query(query, [username, phone, password, roleId]);
        return results.insertId;
    }

    static async createFromTelegram(telegramId, username) {
        const query = 'INSERT INTO users (telegram_id, username, role_id) VALUES (?, ?, ?)';
        const roleId = 3;
        const [results] = await db.query(query, [telegramId, username, roleId]);
        return results.insertId;
    }

    static async handleTelegramUser({ telegramId, username }) {
        let user = await this.getByTelegramId(telegramId);
        if (user) return user;

        const newUserId = await this.createFromTelegram(telegramId, username);
        user = await this.getByTelegramId(telegramId);
        return user;
    }

    static async update(id, username, phone, about) {
        const query = 'UPDATE users SET username = ?, phone = ?, about = ? WHERE id = ?';
        const [results] = await db.query(query, [username, phone, about, id]);
        return results.affectedRows;
    }

    static async updatePassword(id, password) {
        const query = 'UPDATE users SET password = ? WHERE id = ?';
        const [results] = await db.query(query, [password, id]);
        return results.affectedRows;
    }

    static async delete(id) {
        const query = 'DELETE FROM users WHERE id = ?';
        const [results] = await db.query(query, [id]);
        return results.affectedRows;
    }

    static async getFollowers(userId) {
        const query = `
            SELECT u.id, u.username, u.about 
            FROM users u
            JOIN subscriptions s ON u.id = s.follower_id
            WHERE s.user_id = ?
        `;
        const [results] = await db.query(query, [userId]);
        return results;
    }

    static async getSubscriptions(userId) {
        const query = `
            SELECT u.id, u.username, u.about 
            FROM users u
            JOIN subscriptions s ON u.id = s.user_id
            WHERE s.follower_id = ?
        `;
        const [results] = await db.query(query, [userId]);
        return results;
    }

    static async subscribe(userId, followerId) {
        const [user] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (!user.length) {
            throw new Error('Пользователь не найден');
        }
        
        const query = 'INSERT INTO subscriptions (user_id, follower_id) VALUES (?, ?)';
        const [results] = await db.query(query, [userId, followerId]);
        return results.insertId;
    }

    static async unsubscribe(userId, followerId) {
        const query = 'DELETE FROM subscriptions WHERE user_id = ? AND follower_id = ?';
        const [results] = await db.query(query, [userId, followerId]);
        return results;
    }

    static async isSubscribed(userId, followerId) {
        const query = 'SELECT 1 FROM subscriptions WHERE user_id = ? AND follower_id = ? LIMIT 1';
        const [results] = await db.query(query, [userId, followerId]);
        return results.length > 0;
    }

    static async getFollowersCount(userId) {
        const query = 'SELECT COUNT(*) as count FROM subscriptions WHERE user_id = ?';
        const [results] = await db.query(query, [userId]);
        return results[0].count;
    }
    
    static async getSubscriptionsCount(userId) {
        const query = 'SELECT COUNT(*) as count FROM subscriptions WHERE follower_id = ?';
        const [results] = await db.query(query, [userId]);
        return results[0].count;
    }
    
    static async updateUserRole(id, roleId) {
        const query = 'UPDATE users SET role_id = ? WHERE id = ?';
        const [results] = await db.query(query, [roleId, id]);
        return results.affectedRows;
    }

    static async updateAvatar(id, avatarPath) {
        const query = 'UPDATE users SET avatar = ? WHERE id = ?';
        const [results] = await db.query(query, [avatarPath, id]);
        return results.affectedRows;
    }

    static async getAvatar(id) {
        const query = 'SELECT avatar FROM users WHERE id = ?';
        const [results] = await db.query(query, [id]);
        return results[0]?.avatar;
    }
}

module.exports = User;
