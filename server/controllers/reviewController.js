const { Review } = require('../models/models');

class ReviewController {
    // Создание отзыва (только для авторизованных клиентов)
    async create(req, res) {
        try {
            const { rating, comment, masterId } = req.body;
            const clientId = req.user.userId; // предполагается, что клиент авторизован
            if (!clientId) {
                return res.status(403).json({ message: 'Только авторизованные клиенты могут оставлять отзывы' });
            }

            // Создаём отзыв
            const review = await Review.create({
                rating,
                comment,
                clientId,
                masterId,
            });

            res.status(201).json(review);
        } catch (error) {
            console.error('Ошибка при создании отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение конкретного отзыва по ID
    async findOne(req, res) {
        try {
            const review = await Review.findByPk(req.params.id);
            if (!review) {
                return res.status(404).json({ message: 'Отзыв не найден' });
            }
            res.json(review);
        } catch (error) {
            console.error('Ошибка при получении отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение списка отзывов
    async findAll(req, res) {
        try {
            // При наличии query параметра masterId можно фильтровать отзывы по мастеру
            const { masterId } = req.query;
            const where = masterId ? { masterId } : {};
            const reviews = await Review.findAll({ where });
            res.json(reviews);
        } catch (error) {
            console.error('Ошибка при получении списка отзывов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление отзыва (только автор отзыва)
    async update(req, res) {
        try {
            const reviewId = req.params.id;
            const clientId = req.user.userId;
            const review = await Review.findByPk(reviewId);
            if (!review) {
                return res.status(404).json({ message: 'Отзыв не найден' });
            }
            if (review.clientId !== clientId) {
                return res.status(403).json({ message: 'Нет прав для обновления этого отзыва' });
            }
            const { rating, comment } = req.body;
            await review.update({ rating, comment });
            res.json(review);
        } catch (error) {
            console.error('Ошибка при обновлении отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление отзыва (только автор отзыва)
    async delete(req, res) {
        try {
            const reviewId = req.params.id;
            const clientId = req.user.userId;
            const review = await Review.findByPk(reviewId);
            if (!review) {
                return res.status(404).json({ message: 'Отзыв не найден' });
            }
            if (review.clientId !== clientId) {
                return res.status(403).json({ message: 'Нет прав для удаления этого отзыва' });
            }
            await review.destroy();
            res.status(200).json({ message: 'Отзыв успешно удалён' });
        } catch (error) {
            console.error('Ошибка при удалении отзыва:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new ReviewController();