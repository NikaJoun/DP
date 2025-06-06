const express = require('express');
const { 
  getUserInfo, 
  updateUserInfo,
  getUserStats, 
  getFollowers, 
  getSubscriptions, 
  subscribe, 
  unsubscribe, 
  checkSubscription, 
  getNewAuthors,
  getPublicUserInfo
} = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

const validateHandlers = (handlers) => {
  Object.entries(handlers).forEach(([name, handler]) => {
    if (typeof handler !== 'function') {
      throw new Error(`Обработчик ${name} не является функцией`);
    }
  });
};

validateHandlers({
  getUserInfo, 
  updateUserInfo,
  getUserStats, 
  getFollowers, 
  getSubscriptions, 
  subscribe, 
  unsubscribe, 
  checkSubscription, 
  getNewAuthors,
  getPublicUserInfo
});

// Профиль пользователя
router.get('/profile', authenticateToken, getUserInfo);
router.put('/profile', authenticateToken, updateUserInfo);

// Статистика
router.get('/user-stats', authenticateToken, getUserStats);

// Новые авторы
router.get('/new-authors', getNewAuthors);

// Подписки
router.get('/:id/followers', getFollowers);
router.get('/:id/subscriptions', getSubscriptions);
router.post('/:id/subscribe', authenticateToken, subscribe);
router.delete('/:id/unsubscribe', authenticateToken, unsubscribe);
router.get('/:id/check-subscription', authenticateToken, checkSubscription);

// Публичный профиль
router.get('/:id', getPublicUserInfo);

module.exports = router;