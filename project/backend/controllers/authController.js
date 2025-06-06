const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const SECRET_KEY = process.env.SECRET_KEY;

const register = async (req, res) => {
  const { username, phone, password } = req.body;

  if (!username || !phone || !password) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  let connection;
  try {
    connection = await db.getConnection();

    const [existing] = await connection.query(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Пользователь с таким телефоном уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await connection.query(
      'INSERT INTO users (username, phone, password, role_id) VALUES (?, ?, ?, ?)',
      [username, phone, hashedPassword, 2]
    );

    res.status(201).json({ 
      success: true,
      message: 'Пользователь успешно зарегистрирован'
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) connection.release();
  }
};

const login = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'Введите телефон и пароль' });
  }

  let connection;
  try {
    connection = await db.getConnection();

    const [users] = await connection.query(
      'SELECT id, password, role_id FROM users WHERE phone = ?',
      [phone]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Неверный телефон или пароль' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный телефон или пароль' });
    }

    const token = jwt.sign(
      { userId: user.id, roleId: user.role_id },
      SECRET_KEY,
      { expiresIn: '12h' }
    );

    res.json({ 
      success: true,
      token,
      userId: user.id
    });

  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) connection.release();
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token не предоставлен' });
  }

  let connection;
  try {
    connection = await db.getConnection();

    const decoded = jwt.verify(refreshToken, SECRET_KEY);
    
    const [users] = await connection.query(
      'SELECT id, role_id FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = users[0];
    const newAccessToken = jwt.sign(
      { userId: user.id, roleId: user.role_id },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id, roleId: user.role_id },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Ошибка обновления токена:', error);
    res.status(401).json({ 
      error: 'Неверный или просроченный refresh token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  register,
  login,
  refreshToken,
};