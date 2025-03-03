const { Sketch, Booking, Client } = require('../models/models');
const fs = require('fs');
const path = require('path');

class SketchController {
    // Создание нового эскиза (для мастеров и администраторов)
    async create(req, res) {
        try {
            const { title, description, tags } = req.body;
            // Проверяем, что пользователь является мастером или администратором
            if (!req.user.masterId && !req.user.adminId) {
                return res.status(403).json({ message: 'Нет прав для создания эскиза' });
            }

            // Если пользователь администратор, можно ожидать, что masterId передан в теле запроса.
            // Если пользователь мастер – берём masterId из токена.
            const masterId = req.user.masterId || req.body.masterId || null;

            // Обработка изображения (обязательное поле)
            let imagePath = null;
            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/sketches');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                imagePath = `/uploads/sketches/${Date.now()}_${req.file.originalname}`;
                fs.writeFileSync(
                    path.join(uploadDir, `${Date.now()}_${req.file.originalname}`),
                    req.file.buffer
                );
            } else {
                return res.status(400).json({ message: 'Изображение эскиза обязательно' });
            }

            const sketch = await Sketch.create({
                title,
                description,
                image: imagePath,
                tags,
                masterId,
                isReserved: false,
            });

            res.status(201).json(sketch);
        } catch (error) {
            console.error('Ошибка при создании эскиза:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение конкретного эскиза по ID
    async findOne(req, res) {
        try {
            const sketch = await Sketch.findByPk(req.params.id);
            if (!sketch) {
                return res.status(404).json({ message: 'Эскиз не найден' });
            }
            res.json(sketch);
        } catch (error) {
            console.error('Ошибка при получении эскиза:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение списка всех эскизов
    async findAll(req, res) {
        try {
            const sketches = await Sketch.findAll({
                include: [
                    {
                        model: Booking,
                        include: [
                            {
                                model: Client,
                                attributes: ['id', 'firstName', 'lastName', 'email'], // нужные поля
                            }
                        ]
                    }
                ]
            });
            res.json(sketches);
        } catch (error) {
            console.error('Ошибка при получении списка эскизов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление эскиза (для мастера-владельца и администраторов)
    // В методе update контроллера SketchController:
    async update(req, res) {
        try {
            const sketchId = req.params.id;
            let { title, description, tags, isReserved } = req.body;
            if (!req.user.masterId && !req.user.adminId) {
                return res.status(403).json({ message: 'Нет прав для обновления эскиза' });
            }

            const sketch = await Sketch.findByPk(sketchId);
            if (!sketch) {
                return res.status(404).json({ message: 'Эскиз не найден' });
            }
            if (!req.user.adminId && sketch.masterId !== req.user.masterId) {
                return res.status(403).json({ message: 'Вы не можете обновлять этот эскиз' });
            }

            // Преобразуем значение isReserved к булеву типу:
            const isReservedBool = (isReserved === 'true' || isReserved === true);

            let updatedData = { title, description, tags, isReserved: isReservedBool };

            // Обработка нового изображения, если оно передано
            if (req.file) {
                const uploadDir = path.join(__dirname, '../uploads/sketches');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const imagePath = `/uploads/sketches/${sketchId}_${req.file.originalname}`;
                fs.writeFileSync(
                    path.join(uploadDir, `${sketchId}_${req.file.originalname}`),
                    req.file.buffer
                );
                updatedData.image = imagePath;
            }

            await sketch.update(updatedData);

            // Если админ отменяет резервирование (isReservedBool === false), удаляем бронирование, связанное с этим эскизом
            if (req.user.adminId && isReservedBool === false) {
                await Booking.destroy({ where: { sketchId: sketchId } });
            }

            res.json(sketch);
        } catch (error) {
            console.error('Ошибка при обновлении эскиза:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление эскиза (для мастера-владельца и администраторов)
    async delete(req, res) {
        try {
            const sketchId = req.params.id;
            if (!req.user.masterId && !req.user.adminId) {
                return res.status(403).json({ message: 'Нет прав для удаления эскиза' });
            }
            const sketch = await Sketch.findByPk(sketchId);
            if (!sketch) {
                return res.status(404).json({ message: 'Эскиз не найден' });
            }
            // Если пользователь не администратор, проверяем право владения эскизом
            if (!req.user.adminId && sketch.masterId !== req.user.masterId) {
                return res.status(403).json({ message: 'Вы не можете удалять этот эскиз' });
            }
            await sketch.destroy();
            res.status(200).json({ message: 'Эскиз успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении эскиза:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new SketchController();