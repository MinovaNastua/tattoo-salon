const { PortfolioPhoto } = require('../models/models');
const fs = require('fs');
const path = require('path');

class PortfolioPhotoController {
    // Создание нового фото портфолио (для мастера и администратора)
    async create(req, res) {
        try {
            const { title, description, tags } = req.body;
            // Проверяем, что пользователь является мастером или администратором
            if (!req.user.masterId && !req.user.adminId) {
                return res.status(403).json({ message: 'Нет прав для создания фото портфолио' });
            }

            // Если пользователь администратор, можно ожидать masterId в теле запроса, иначе берём из токена
            const masterId = req.user.masterId || req.body.masterId || null;

            if (!req.file) {
                return res.status(400).json({ message: 'Изображение обязательно для загрузки' });
            }

            const uploadDir = path.join(__dirname, '../uploads/portfolioPhotos');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const imagePath = `/uploads/portfolioPhotos/${Date.now()}_${req.file.originalname}`;
            fs.writeFileSync(path.join(uploadDir, `${Date.now()}_${req.file.originalname}`), req.file.buffer);

            const photo = await PortfolioPhoto.create({
                title,
                description,
                image: imagePath,
                tags,
                masterId,
            });

            res.status(201).json(photo);
        } catch (error) {
            console.error('Ошибка при создании фото портфолио:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение конкретного фото портфолио по ID
    async findOne(req, res) {
        try {
            const photo = await PortfolioPhoto.findByPk(req.params.id);
            if (!photo) {
                return res.status(404).json({ message: 'Фото портфолио не найдено' });
            }
            res.json(photo);
        } catch (error) {
            console.error('Ошибка при получении фото портфолио:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение списка всех фото портфолио
    async findAll(req, res) {
        try {
            const photos = await PortfolioPhoto.findAll();
            res.json(photos);
        } catch (error) {
            console.error('Ошибка при получении списка фото портфолио:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление фото портфолио (для владельца или администратора)
    async update(req, res) {
        try {
            const photoId = req.params.id;
            const { title, description, tags } = req.body;
            // Проверяем, что пользователь является мастером или администратором
            if (!req.user.masterId && !req.user.adminId) {
                return res.status(403).json({ message: 'Нет прав для обновления фото портфолио' });
            }

            const photo = await PortfolioPhoto.findByPk(photoId);
            if (!photo) {
                return res.status(404).json({ message: 'Фото портфолио не найдено' });
            }
            // Если пользователь не администратор, проверяем, что он является владельцем фото
            if (!req.user.adminId && photo.masterId !== req.user.masterId) {
                return res.status(403).json({ message: 'Вы не можете обновлять это фото портфолио' });
            }

            let updatedData = { title, description, tags };
            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/portfolioPhotos');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const imagePath = `/uploads/portfolioPhotos/${photoId}_${req.file.originalname}`;
                fs.writeFileSync(path.join(uploadDir, `${photoId}_${req.file.originalname}`), req.file.buffer);
                updatedData.image = imagePath;
            }

            await photo.update(updatedData);
            res.json(photo);
        } catch (error) {
            console.error('Ошибка при обновлении фото портфолио:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление фото портфолио (для владельца или администратора)
    async delete(req, res) {
        try {
            const photoId = req.params.id;
            if (!req.user.masterId && !req.user.adminId) {
                return res.status(403).json({ message: 'Нет прав для удаления фото портфолио' });
            }

            const photo = await PortfolioPhoto.findByPk(photoId);
            if (!photo) {
                return res.status(404).json({ message: 'Фото портфолио не найдено' });
            }
            // Если пользователь не администратор, проверяем, что он является владельцем фото
            if (!req.user.adminId && photo.masterId !== req.user.masterId) {
                return res.status(403).json({ message: 'Вы не можете удалять это фото портфолио' });
            }
            await photo.destroy();
            res.status(200).json({ message: 'Фото портфолио успешно удалено' });
        } catch (error) {
            console.error('Ошибка при удалении фото портфолио:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new PortfolioPhotoController();