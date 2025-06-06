const db = require('../config/db');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';
const TELEGRAM_BOT_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

class TelegramAuthController {
  verifyCode = async (req, res) => {
    const { code } = req.query;
    console.log('Verifying code:', code);

    if (!code) {
      return res.status(400).json({ error: 'Код не предоставлен' });
    }

    let conn;
    try {
      conn = await db.getConnection();

      const [codes] = await conn.query(
        `SELECT chat_id FROM telegram_auth_codes 
         WHERE code = ? AND is_used = 0 AND expires_at > NOW()`,
        [code]
      );

      if (codes.length === 0) {
        return res.status(404).json({ 
          error: 'Неверный код',
          details: 'Код не найден, уже использован или истек'
        });
      }

      const chatId = codes[0].chat_id;

      const { username, bio } = await this.getUserDetailsFromTelegram(chatId);

      const { token, user, isUsernameChanged } = await TelegramAuthController.handleUser(conn, chatId, username, bio);

      await conn.query(
        'UPDATE telegram_auth_codes SET is_used = 1 WHERE code = ?',
        [code]
      );

      if (isUsernameChanged) {
        await TelegramAuthController.sendUsernameChangeMessage(chatId);
      } else {
        await TelegramAuthController.sendSuccessMessage(chatId);
      }

      res.json({ 
        success: true,
        token,
        user
      });

    } catch (err) {
      console.error('Verify code error:', err);
      res.status(500).json({ 
        error: 'Ошибка сервера',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    } finally {
      if (conn) conn.release();
    }
  }

  async getUserDetailsFromTelegram(chatId) {
    try {
      const response = await axios.get(`${TELEGRAM_BOT_API}/getChat?chat_id=${chatId}`);
      console.log('Telegram API response:', response.data);
      if (response.data && response.data.result) {
        const username = response.data.result.username || `tg_${chatId}`;
        const bio = response.data.result.bio || '';
        return { username, bio };
      }
      return { username: `tg_${chatId}`, bio: '' };
    } catch (error) {
      console.error('Ошибка при получении username и bio из Telegram API:', error);
      return { username: `tg_${chatId}`, bio: '' };
    }
  }

  static async handleUser(conn, chatId, username, bio) {
    const [users] = await conn.query(
      'SELECT id, username, role_id, about FROM users WHERE telegram_id = ?',
      [chatId]
    );

    if (users.length > 0) {
      const user = users[0];
      const token = TelegramAuthController.generateToken(user.id, user.role_id);
      return { token, user, isUsernameChanged: false };
    }

    let uniqueUsername = username;
    let [existingUsernames] = await conn.query(
      'SELECT id FROM users WHERE username = ?',
      [uniqueUsername]
    );

    let isUsernameChanged = false;
    if (existingUsernames.length > 0) {
      let counter = 1;
      while (existingUsernames.length > 0) {
        uniqueUsername = `${username}${counter}`;
        [existingUsernames] = await conn.query(
          'SELECT id FROM users WHERE username = ?',
          [uniqueUsername]
        );
        counter++;
      }
      isUsernameChanged = true;
    }

    const roleId = 3;

    const [result] = await conn.query(
      `INSERT INTO users (telegram_id, username, role_id, about) 
       VALUES (?, ?, ?, ?)`,
      [chatId, uniqueUsername, roleId, bio]
    );

    const userId = result.insertId;

    const token = TelegramAuthController.generateToken(userId, roleId);

    return {
      token,
      user: {
        id: userId,
        username: uniqueUsername,
        role_id: roleId,
        about: bio
      },
      isUsernameChanged
    };
  }

  static async sendUsernameChangeMessage(chatId) {
    try {
      await axios.post(`${TELEGRAM_BOT_API}/sendMessage`, {
        chat_id: chatId,
        text: '✅ Вы успешно зарегистрированы. Пожалуйста, измените ваше имя пользователя в личных настройках. Для этого перейдите в настройки профиля и выберите новое имя.',
      });
    } catch (error) {
      console.error('Ошибка при отправке сообщения пользователю:', error);
    }
  }

  static async sendSuccessMessage(chatId) {
    try {
      await axios.post(`${TELEGRAM_BOT_API}/sendMessage`, {
        chat_id: chatId,
        text: '✅ Вы успешно авторизовались!',
      });
    } catch (error) {
      console.error('Ошибка при отправке сообщения о успешной авторизации:', error);
    }
  }

  static generateToken(userId, roleId) {
    return jwt.sign(
      { userId, roleId },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
  }
}

module.exports = new TelegramAuthController();
