const express = require('express');
const cors = require('cors');
const http = require('http');
const jwt = require('jsonwebtoken');
require('./bot/telegramBot');
require('dotenv').config();
const path = require('path');

require('./cron/cleanTelegramCodes');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
const telegramAuthRoutes = require('./routes/telegramAuthRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const avatarRoutes = require('./routes/avatarRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const coverRoutes = require('./routes/coverRoutes');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    'http://starsclub.serveo.net',
    'http://localhost:8080',
    'http://localhost:5000',
    'https://web.telegram.org'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/', authRoutes);
app.use('/api/', postRoutes);
app.use('/api/user', userRoutes);
app.use('/api/', commentRoutes);
app.use('/api/', telegramAuthRoutes);
app.use('/api/', adminRoutes);
app.use('/api/', eventRoutes);
app.use('/api/', avatarRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/', coverRoutes);


server.listen(port, '0.0.0.0', () => {
  console.log(`Сервер запущен на порту ${port}`);
});

module.exports = { app, server };