const express = require('express');
const router = express.Router();
const telegramAuthController = require('../controllers/telegramAuthController');

router.get('/verify-tg-code', telegramAuthController.verifyCode);

module.exports = router;