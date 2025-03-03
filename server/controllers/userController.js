const { Client } = require('../models/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

class UserController {
    // Регистрация пользователя (Client)
    async registration(req, res) {
        try {
            const { firstName, lastName, email, password, phone } = req.body;

            const existingUser = await Client.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            // Если файл передан, используем его имя, иначе оставляем null
            const photo = req.file ? req.file.filename : null;

            const client = await Client.create({
                firstName,
                lastName,
                email,
                password: passwordHash,
                phone,
                photo, // новое поле
            });

            const token = jwt.sign(
                { userId: client.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.status(201).json({ token, user: client });
        } catch (error) {
            console.error('Ошибка при регистрации пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Вход пользователя (Client)
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const client = await Client.findOne({ where: { email } });
            if (!client) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            const isMatch = await bcrypt.compare(password, client.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            const token = jwt.sign(
                { userId: client.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: client,
                role: 'client'
            });
        } catch (error) {
            console.error('Ошибка при входе пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Проверка аутентификации пользователя по токену
    async auth(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Не авторизован' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            const client = await Client.findByPk(decoded.userId);

            res.json({ client, role: 'client' });
        } catch (error) {
            console.error('Ошибка при аутентификации пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение данных конкретного пользователя по ID
    async findOne(req, res) {
        try {
            const client = await Client.findByPk(req.params.id);
            if (!client) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            res.json(client);
        } catch (error) {
            console.error('Ошибка при получении пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение списка всех пользователей
    async findAll(req, res) {
        try {
            const clients = await Client.findAll();
            res.json(clients);
        } catch (error) {
            console.error('Ошибка при получении списка пользователей:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление профиля пользователя (только свой)
    async update(req, res) {
        try {
            const { firstName, lastName, email, password, phone } = req.body;
            const userId = req.params.id;

            if (req.user.userId !== parseInt(userId, 10)) {
                return res.status(403).json({ message: 'Нет прав для обновления этого профиля' });
            }

            const client = await Client.findByPk(userId);
            if (!client) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            let updatedData = { firstName, lastName, email, phone };
            if (password) {
                updatedData.password = await bcrypt.hash(password, 12);
            }

            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/users');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const fileName = `${userId}_${req.file.originalname}`;
                const photoPath = `/uploads/users/${fileName}`;
                fs.writeFileSync(path.join(uploadDir, fileName), req.file.buffer);
                updatedData.photo = photoPath;
            }

            await client.update(updatedData);

            res.json(client);
        } catch (error) {
            console.error('Ошибка при обновлении пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление профиля пользователя (только свой)
    async delete(req, res) {
        try {
            const userId = req.params.id;

            if (req.user.userId !== parseInt(userId, 10)) {
                return res.status(403).json({ message: 'Нет прав для удаления этого профиля' });
            }

            const client = await Client.findByPk(userId);
            if (!client) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            await client.destroy();

            res.status(200).json({ message: 'Пользователь успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new UserController();
