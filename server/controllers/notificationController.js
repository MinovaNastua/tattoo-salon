const { Notification } = require('../models/models');

class NotificationController {
    // Создание уведомления (разрешено только администраторам)
    async create(req, res) {
        try {
            // Проверяем, что уведомление создаётся администратором
            if (!req.user || !req.user.adminId) {
                return res.status(403).json({ message: 'Нет прав для создания уведомления' });
            }
            const { recipientType, recipientId, message, type } = req.body;
            const notification = await Notification.create({
                recipientType,
                recipientId,
                message,
                type,
            });
            res.status(201).json(notification);
        } catch (error) {
            console.error('Ошибка при создании уведомления:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение всех уведомлений для текущего пользователя (для клиента или мастера)
    async findAll(req, res) {
        try {
            let notifications;
            if (req.user.userId) {
                // текущий пользователь – клиент
                notifications = await Notification.findAll({
                    where: { recipientType: 'client', recipientId: req.user.userId },
                });
            } else if (req.user.masterId) {
                // текущий пользователь – мастер
                notifications = await Notification.findAll({
                    where: { recipientType: 'master', recipientId: req.user.masterId },
                });
            } else {
                return res.status(403).json({ message: 'Нет прав для доступа к уведомлениям' });
            }
            res.json(notifications);
        } catch (error) {
            console.error('Ошибка при получении уведомлений:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение уведомления по ID
    async findOne(req, res) {
        try {
            const notification = await Notification.findByPk(req.params.id);
            if (!notification) {
                return res.status(404).json({ message: 'Уведомление не найдено' });
            }
            // Проверяем, что уведомление принадлежит текущему пользователю
            if (notification.recipientType === 'client' && req.user.userId !== notification.recipientId) {
                return res.status(403).json({ message: 'Нет прав для доступа к этому уведомлению' });
            }
            if (notification.recipientType === 'master' && req.user.masterId !== notification.recipientId) {
                return res.status(403).json({ message: 'Нет прав для доступа к этому уведомлению' });
            }
            res.json(notification);
        } catch (error) {
            console.error('Ошибка при получении уведомления:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление уведомления (например, для отметки как прочитанное)
    async update(req, res) {
        try {
            const notification = await Notification.findByPk(req.params.id);
            if (!notification) {
                return res.status(404).json({ message: 'Уведомление не найдено' });
            }
            // Разрешаем обновление только владельцу уведомления
            if (notification.recipientType === 'client' && req.user.userId !== notification.recipientId) {
                return res.status(403).json({ message: 'Нет прав для обновления этого уведомления' });
            }
            if (notification.recipientType === 'master' && req.user.masterId !== notification.recipientId) {
                return res.status(403).json({ message: 'Нет прав для обновления этого уведомления' });
            }
            const { message, isRead, type } = req.body;
            await notification.update({ message, isRead, type });
            res.json(notification);
        } catch (error) {
            console.error('Ошибка при обновлении уведомления:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление уведомления
    async delete(req, res) {
        try {
            const notification = await Notification.findByPk(req.params.id);
            if (!notification) {
                return res.status(404).json({ message: 'Уведомление не найдено' });
            }
            // Разрешаем удаление только владельцу уведомления
            if (notification.recipientType === 'client' && req.user.userId !== notification.recipientId) {
                return res.status(403).json({ message: 'Нет прав для удаления этого уведомления' });
            }
            if (notification.recipientType === 'master' && req.user.masterId !== notification.recipientId) {
                return res.status(403).json({ message: 'Нет прав для удаления этого уведомления' });
            }
            await notification.destroy();
            res.status(200).json({ message: 'Уведомление успешно удалено' });
        } catch (error) {
            console.error('Ошибка при удалении уведомления:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new NotificationController();
