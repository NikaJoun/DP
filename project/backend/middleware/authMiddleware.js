const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const SECRET_KEY = process.env.SECRET_KEY;

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).send({ error: 'Отсутствует токен' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send({ error: 'Неверный или просроченный токен' });
    }

    req.userId = decoded.userId;
    req.roleId = decoded.roleId;
    next();
  });
};

module.exports = authenticateToken;
