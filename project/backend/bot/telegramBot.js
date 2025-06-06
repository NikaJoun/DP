const TelegramBot = require('node-telegram-bot-api');
const db = require('../config/db');
const crypto = require('crypto');
const { setTimeout } = require('timers/promises');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CODE_LENGTH = 6;
const CODE_LIFETIME_MINUTES = 5;
const POLLING_RETRY_DELAY = 10000; 

class TelegramBotWrapper {
  constructor() {
    this.bot = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    try {
      this.bot = new TelegramBot(BOT_TOKEN, {
        polling: {
          interval: 300,
          autoStart: true,
          params: { timeout: 10 }
        }
      });

      this.setupHandlers();
      this.setupErrorHandling();

      await this.testConnection();
      console.log('Telegram bot initialized');
    } catch (err) {
      console.error('Bot initialization failed:', err);
      this.retryInitialization();
    }
  }

  async testConnection() {
    try {
      await this.bot.getMe();
      this.isConnected = true;
      console.log('Telegram API connection OK');
    } catch (err) {
      this.isConnected = false;
      throw err;
    }
  }

  setupHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      if (!this.isConnected) {
        return this.bot.sendMessage(msg.chat.id, '⚠️ Бот временно недоступен. Попробуйте позже.');
      }

      try {
        const chatId = msg.chat.id;
        const code = this.generateAuthCode();
        
        await this.saveAuthCode(chatId, code);
        
        await this.bot.sendMessage(
          chatId,
          `🔐 Ваш код авторизации: <b>${code}</b>\n\n` +
          `Код действителен ${CODE_LIFETIME_MINUTES} минут.`,
          { parse_mode: 'HTML' }
        );
        
        console.log(`Generated code ${code} for ${chatId}`);
      } catch (err) {
        console.error('Error handling /start:', err);
      }
    });
  }

  setupErrorHandling() {
    this.bot.on('polling_error', async (error) => {
      console.error('Polling error:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      this.isConnected = false;
      await this.restartPolling();
    });

    this.bot.on('webhook_error', (error) => {
      console.error('Webhook error:', error);
    });
  }

  async restartPolling() {
    try {
      console.log(`Restarting polling in ${POLLING_RETRY_DELAY/1000} sec...`);
      await setTimeout(POLLING_RETRY_DELAY);
      
      this.bot.stopPolling();
      this.bot.startPolling();
      await this.testConnection();
      
      console.log('Polling restarted successfully');
    } catch (err) {
      console.error('Failed to restart polling:', err);
      this.retryInitialization();
    }
  }

  async retryInitialization() {
    console.log(`Retrying initialization in ${POLLING_RETRY_DELAY/1000} sec...`);
    await setTimeout(POLLING_RETRY_DELAY);
    this.init();
  }

  generateAuthCode() {
    return crypto.randomBytes(CODE_LENGTH)
      .toString('hex')
      .toUpperCase()
      .slice(0, CODE_LENGTH);
  }

  async saveAuthCode(chatId, code) {
    let conn;
    try {
      conn = await db.getConnection();
      await conn.query(
        `INSERT INTO telegram_auth_codes 
         (chat_id, code, expires_at) 
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
        [chatId, code, CODE_LIFETIME_MINUTES]
      );
    } catch (err) {
      console.error('Error saving auth code:', err);
      throw err;
    } finally {
      if (conn) conn.release();
    }
  }

  shutdown() {
    if (this.bot) {
      this.bot.stopPolling();
    }
  }
}

new TelegramBotWrapper();

setInterval(async () => {
  let conn;
  try {
    conn = await db.getConnection();
    const [result] = await conn.query(
      'DELETE FROM telegram_auth_codes WHERE expires_at < NOW()'
    );
    if (result.affectedRows > 0) {
      console.log(`Cleaned ${result.affectedRows} expired codes`);
    }
  } catch (err) {
    console.error('Error cleaning codes:', err);
  } finally {
    if (conn) conn.release();
  }
}, 10 * 60 * 1000);

process.on('SIGINT', () => {
  console.log('Shutting down bot...');
  process.exit();
});

module.exports = TelegramBotWrapper;