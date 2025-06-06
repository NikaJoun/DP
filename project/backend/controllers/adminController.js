const User = require('../models/userModel'); 
const db = require('../config/db');

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.id, u.username, u.phone, u.created_at, u.role_id as roleId, r.name as role 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
        `);
        res.json(users);
    } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
        res.status(500).json({ message: 'Ошибка при получении пользователей', error: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    const { userId, roleId } = req.body;
    
    if (!userId || !roleId) {
        return res.status(400).json({ 
            success: false,
            message: 'Недостаточно данных для обновления роли' 
        });
    }
  
    try {
        const [updateResult] = await db.query('UPDATE users SET role_id = ? WHERE id = ?', [roleId, userId]);
  
        if (updateResult.affectedRows > 0) {
            const [users] = await db.query(`
                SELECT u.id, u.username, u.role_id as roleId, r.name as role
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE u.id = ?
            `, [userId]);
            
            if (users.length > 0) {
                const updatedUser = users[0];
                return res.json({ 
                    success: true,
                    message: 'Роль успешно обновлена',
                    user: updatedUser
                });
            } else {
                return res.status(404).json({ 
                    success: false,
                    message: 'Пользователь не найден после обновления' 
                });
            }
        } else {
            return res.status(404).json({ 
                success: false,
                message: 'Пользователь не найден' 
            });
        }
    } catch (error) {
        console.error('Ошибка при обновлении роли:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Ошибка сервера при обновлении роли',
            error: error.message
        });
    }
};