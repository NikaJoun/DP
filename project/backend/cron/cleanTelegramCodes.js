const cron = require('node-cron');
const db = require('../config/db');

const cleanTelegramCodes = async () => {
  let conn;
  try {
    conn = await db.getConnection();
    const [result] = await conn.query(
      'DELETE FROM telegram_auth_codes WHERE is_used = 1 OR expires_at < NOW()'
    );
    console.log(`[Cron] Удалено ${result.affectedRows} старых/использованных Telegram-кодов`);
  } catch (err) {
    console.error('[Cron] Ошибка при очистке Telegram-кодов:', err);
  } finally {
    if (conn) conn.release();
  }
};

cron.schedule('*/10 * * * *', () => {
  console.log('[Cron] Запуск автоочистки Telegram-кодов...');
  cleanTelegramCodes();
});