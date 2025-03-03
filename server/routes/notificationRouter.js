const express = require('express');
const Router = require('express').Router;
const NotificationController = require('../controllers/notificationController');
const authenticateToken = require('../middleware/authenticateToken');

const router = Router();

// Создание уведомления (только для администраторов)
router.post('/', authenticateToken, NotificationController.create);

// Получение всех уведомлений для текущего пользователя (клиент или мастер)
router.get('/', authenticateToken, NotificationController.findAll);

// Получение конкретного уведомления по ID
router.get('/:id', authenticateToken, NotificationController.findOne);

// Обновление уведомления (например, отметить как прочитанное)
router.put('/:id', authenticateToken, NotificationController.update);

// Удаление уведомления
router.delete('/:id', authenticateToken, NotificationController.delete);

module.exports = router;