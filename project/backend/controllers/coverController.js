const path = require('path');
const fs = require('fs');
const Post = require('../models/postModel');

class CoverController {
    static async uploadCover(req, res) {
        try {
            if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
            }

            const coverUrl = `/uploads/covers/${req.file.filename}`;
            res.json({ success: true, coverUrl });
        } catch (error) {
            console.error('Ошибка загрузки обложки:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    static async deleteCover(req, res) {
        try {
            const { filename } = req.params;
            const filePath = path.join(__dirname, '../uploads/covers', filename);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                await Post.removeCoverReference(filename);
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Ошибка удаления обложки:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
}

module.exports = CoverController;