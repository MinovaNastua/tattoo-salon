const { Admin } = require('../models/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AdminController {
    // Регистрация администратора
    async registration(req, res) {
        try {
            const { username, email, password } = req.body;

            const existingAdmin = await Admin.findOne({ where: { email } });
            if (existingAdmin) {
                return res.status(400).json({ message: 'Администратор с таким email уже существует' });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const admin = await Admin.create({
                username,
                email,
                password: passwordHash,
            });

            // Возвращаем только объект администратора без токена и роли
            res.status(201).json(admin);
        } catch (error) {
            console.error('Ошибка при регистрации администратора:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Вход администратора
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const admin = await Admin.findOne({ where: { email } });
            if (!admin) {
                return res.status(404).json({ message: 'Администратор не найден' });
            }

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            const token = jwt.sign(
                { adminId: admin.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                admin,
                role: 'admin'
            });
        } catch (error) {
            console.error('Ошибка при входе администратора:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Аутентификация администратора по токену
    async auth(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Не авторизован' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            const admin = await Admin.findByPk(decoded.adminId);

            res.json({ admin });
        } catch (error) {
            console.error('Ошибка при аутентификации администратора:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение данных администратора по ID
    async findOne(req, res) {
        try {
            const admin = await Admin.findByPk(req.params.id);
            if (!admin) {
                return res.status(404).json({ message: 'Администратор не найден' });
            }
            res.json(admin);
        } catch (error) {
            console.error('Ошибка при получении администратора:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение списка всех администраторов
    async findAll(req, res) {
        try {
            const admins = await Admin.findAll();
            res.json(admins);
        } catch (error) {
            console.error('Ошибка при получении списка администраторов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление профиля администратора (только своего)
    async update(req, res) {
        try {
            const { username, email, password } = req.body;
            const adminId = req.params.id;

            if (req.user.adminId !== parseInt(adminId, 10)) {
                return res.status(403).json({ message: 'Нет прав для обновления этого профиля' });
            }

            const admin = await Admin.findByPk(adminId);
            if (!admin) {
                return res.status(404).json({ message: 'Администратор не найден' });
            }

            let updatedData = { username, email };
            if (password) {
                updatedData.password = await bcrypt.hash(password, 12);
            }

            await admin.update(updatedData);

            res.json(admin);
        } catch (error) {
            console.error('Ошибка при обновлении администратора:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление профиля администратора (только своего)
    async delete(req, res) {
        try {
            const adminId = req.params.id;

            if (req.user.adminId !== parseInt(adminId, 10)) {
                return res.status(403).json({ message: 'Нет прав для удаления этого профиля' });
            }

            const admin = await Admin.findByPk(adminId);
            if (!admin) {
                return res.status(404).json({ message: 'Администратор не найден' });
            }

            await admin.destroy();

            res.status(200).json({ message: 'Администратор успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении администратора:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new AdminController();