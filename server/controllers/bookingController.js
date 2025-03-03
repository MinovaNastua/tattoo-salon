const { Booking, Sketch } = require('../models/models');

class BookingController {
    // Создание нового бронирования (резервация эскиза или запись на приём)
    async create(req, res) {
        try {
            const { bookingType, sketchId, masterId, bookingTime } = req.body;
            let clientId;

            // Если бронирование создаёт клиент
            if (req.user.userId) {
                clientId = req.user.userId;
            }
            // Если бронирование создаёт администратор, clientId должен быть указан в теле запроса
            else if (req.user.adminId) {
                clientId = req.body.clientId;
                if (!clientId) {
                    return res.status(400).json({ message: 'При создании бронирования администратором необходимо указать clientId' });
                }
            } else {
                return res.status(403).json({ message: 'Только авторизованные клиенты или администраторы могут создавать бронирования' });
            }

            let bookingData = { bookingType, clientId, status: 'pending' };

            if (bookingType === 'sketch') {
                if (!sketchId) {
                    return res.status(400).json({ message: 'Для бронирования эскиза необходимо указать sketchId' });
                }
                bookingData.sketchId = sketchId;
            } else if (bookingType === 'appointment') {
                if (!masterId || !bookingTime) {
                    return res.status(400).json({ message: 'Для записи на приём необходимо указать masterId и bookingTime' });
                }
                bookingData.masterId = masterId;
                bookingData.bookingTime = bookingTime;
            } else {
                return res.status(400).json({ message: 'Неверный тип бронирования' });
            }

            const booking = await Booking.create(bookingData);

            // Обновляем статус эскиза на зарезервированный
            if (bookingType === 'sketch') {
                await Sketch.update({ isReserved: true }, { where: { id: sketchId } });
            }

            res.status(201).json(booking);
        } catch (error) {
            console.error('Ошибка при создании бронирования:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение бронирования по ID
    async findOne(req, res) {
        try {
            const booking = await Booking.findByPk(req.params.id);
            if (!booking) {
                return res.status(404).json({ message: 'Бронирование не найдено' });
            }
            res.json(booking);
        } catch (error) {
            console.error('Ошибка при получении бронирования:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение всех бронирований для текущего пользователя (клиента, мастера или админа)
    async findAll(req, res) {
        try {
            let bookings;
            if (req.user.adminId) {
                // Администратор видит все бронирования
                bookings = await Booking.findAll();
            } else if (req.user.userId) {
                // Клиент видит только свои бронирования
                bookings = await Booking.findAll({ where: { clientId: req.user.userId } });
            } else if (req.user.masterId) {
                // Мастер видит бронирования, связанные с ним
                bookings = await Booking.findAll({ where: { masterId: req.user.masterId } });
            } else {
                bookings = await Booking.findAll();
            }
            res.json(bookings);
        } catch (error) {
            console.error('Ошибка при получении списка бронирований:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление бронирования (например, изменение статуса или времени)
    async update(req, res) {
        try {
            const bookingId = req.params.id;
            const { status, bookingTime } = req.body;
            const booking = await Booking.findByPk(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Бронирование не найдено' });
            }
            // Если пользователь не является администратором, проверяем права доступа:
            // Для бронирования типа "sketch" обновлять может только клиент-владелец.
            // Для "appointment" обновлять может клиент или мастер, если они являются владельцами.
            if (booking.bookingType === 'sketch' && !req.user.adminId && req.user.userId !== booking.clientId) {
                return res.status(403).json({ message: 'Нет прав для обновления этого бронирования' });
            }
            if (
                booking.bookingType === 'appointment' &&
                !req.user.adminId &&
                req.user.userId !== booking.clientId &&
                req.user.masterId !== booking.masterId
            ) {
                return res.status(403).json({ message: 'Нет прав для обновления этого бронирования' });
            }

            if (status) booking.status = status;
            if (bookingTime) booking.bookingTime = bookingTime;

            await booking.save();
            res.json(booking);
        } catch (error) {
            console.error('Ошибка при обновлении бронирования:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление бронирования
    async delete(req, res) {
        try {
            const bookingId = req.params.id;
            const booking = await Booking.findByPk(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Бронирование не найдено' });
            }
            // Если пользователь не является администратором, проверяем права удаления:
            // Для бронирования типа "sketch" удалять может только клиент-владелец.
            // Для "appointment" удалять может клиент или мастер, если они являются владельцами.
            if (booking.bookingType === 'sketch' && !req.user.adminId && req.user.userId !== booking.clientId) {
                return res.status(403).json({ message: 'Нет прав для удаления этого бронирования' });
            }
            if (
                booking.bookingType === 'appointment' &&
                !req.user.adminId &&
                req.user.userId !== booking.clientId &&
                req.user.masterId !== booking.masterId
            ) {
                return res.status(403).json({ message: 'Нет прав для удаления этого бронирования' });
            }

            await booking.destroy();
            res.status(200).json({ message: 'Бронирование успешно удалено' });
        } catch (error) {
            console.error('Ошибка при удалении бронирования:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new BookingController();
