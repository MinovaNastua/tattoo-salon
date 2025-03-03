const { Master } = require('../models/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

class MasterController {
    // Регистрация мастера
    async registration(req, res) {
        try {
            const { firstName, lastName, email, password, phone, biography, experience } = req.body;

            const existingMaster = await Master.findOne({ where: { email } });
            if (existingMaster) {
                return res.status(400).json({ message: 'Мастер с таким email уже существует' });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            // Если предполагается загрузка фото, можно обработать его (пока модель не содержит поля photo)
            let photoPath = null;
            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/masters');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                photoPath = `/uploads/masters/${Date.now()}_${req.file.originalname}`;
                fs.writeFileSync(path.join(uploadDir, `${Date.now()}_${req.file.originalname}`), req.file.buffer);
            }

            const master = await Master.create({
                firstName,
                lastName,
                email,
                password: passwordHash,
                phone,
                biography,
                experience: experience ? parseInt(experience, 10) : null,
                photo: photoPath,
            });

            res.status(201).json(master);
        } catch (error) {
            console.error('Ошибка при регистрации мастера:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Вход мастера
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const master = await Master.findOne({ where: { email } });
            if (!master) {
                return res.status(404).json({ message: 'Мастер не найден' });
            }

            const isMatch = await bcrypt.compare(password, master.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            const token = jwt.sign(
                { masterId: master.id },
                process.env.JWT_SECRET || 'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                master,
                role: 'master'
            });
        } catch (error) {
            console.error('Ошибка при входе мастера:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Аутентификация мастера по токену
    async auth(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Не авторизован' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            const master = await Master.findByPk(decoded.masterId);

            res.json({ master, role: 'master' });
        } catch (error) {
            console.error('Ошибка при аутентификации мастера:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение данных мастера по ID
    async findOne(req, res) {
        try {
            const master = await Master.findByPk(req.params.id);
            if (!master) {
                return res.status(404).json({ message: 'Мастер не найден' });
            }
            res.json(master);
        } catch (error) {
            console.error('Ошибка при получении мастера:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение списка всех мастеров
    async findAll(req, res) {
        try {
            const masters = await Master.findAll();
            res.json(masters);
        } catch (error) {
            console.error('Ошибка при получении списка мастеров:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление профиля мастера (свой профиль или любой, если выполняет администратор)
    async update(req, res) {
        try {
            const { firstName, lastName, email, password, phone, biography, experience } = req.body;
            const masterId = req.params.id;

            // Если пользователь не администратор, проверяем, что обновляется свой профиль
            if (!req.user.adminId && req.user.masterId !== parseInt(masterId, 10)) {
                return res.status(403).json({ message: 'Нет прав для обновления этого профиля' });
            }

            const master = await Master.findByPk(masterId);
            if (!master) {
                return res.status(404).json({ message: 'Мастер не найден' });
            }

            let updatedData = { firstName, lastName, email, phone, biography };
            if (experience) {
                updatedData.experience = parseInt(experience, 10);
            }
            if (password) {
                updatedData.password = await bcrypt.hash(password, 12);
            }

            // Обработка файла (если планируется загрузка фото)
            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/masters');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const photoPath = `/uploads/masters/${masterId}_${req.file.originalname}`;
                fs.writeFileSync(path.join(uploadDir, `${masterId}_${req.file.originalname}`), req.file.buffer);
                updatedData.photo = photoPath;
            }

            await master.update(updatedData);

            res.json(master);
        } catch (error) {
            console.error('Ошибка при обновлении профиля мастера:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление профиля мастера (своего или любого, если выполняет администратор)
    async delete(req, res) {
        try {
            const masterId = req.params.id;

            // Если пользователь не администратор, проверяем, что удаляется свой профиль
            if (!req.user.adminId && req.user.masterId !== parseInt(masterId, 10)) {
                return res.status(403).json({ message: 'Нет прав для удаления этого профиля' });
            }

            const master = await Master.findByPk(masterId);
            if (!master) {
                return res.status(404).json({ message: 'Мастер не найден' });
            }

            await master.destroy();

            res.status(200).json({ message: 'Мастер успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении профиля мастера:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new MasterController();