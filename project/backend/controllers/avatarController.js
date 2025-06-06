const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const User = require('../models/userModel');

class AvatarController {
    static async uploadAvatar(req, res) {
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }

        const userId = req.userId;
        const avatarPath = `/uploads/avatars/${req.file.filename}`;

        try {
            const oldAvatar = await User.getAvatar(userId);
            if (oldAvatar) {
                const oldPath = path.join(__dirname, '../..', oldAvatar);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            await User.updateAvatar(userId, avatarPath);

            res.json({ 
                success: true,
                avatar: avatarPath 
            });
        } catch (error) {
            console.error('Ошибка при загрузке аватарки:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    static async deleteAvatar(req, res) {
        const userId = req.userId;

        try {
            const oldAvatar = await User.getAvatar(userId);
            if (oldAvatar) {
                const oldPath = path.join(__dirname, '../..', oldAvatar);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            await User.updateAvatar(userId, null);

            res.json({ 
                success: true,
                message: 'Аватар удален' 
            });
        } catch (error) {
            console.error('Ошибка при удалении аватарки:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
}

module.exports = AvatarController;