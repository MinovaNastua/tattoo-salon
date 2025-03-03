const express = require('express');
const Router = require('express').Router;
const ReviewController = require('../controllers/reviewController');
const authenticateToken = require('../middleware/authenticateToken');

const router = Router();

// Создание отзыва (только для авторизованных клиентов)
router.post('/', authenticateToken, ReviewController.create);

// Получение списка отзывов (опционально можно фильтровать по masterId через query параметр)
router.get('/', ReviewController.findAll);

// Получение конкретного отзыва по ID
router.get('/:id', ReviewController.findOne);

// Обновление отзыва (только автор отзыва)
router.put('/:id', authenticateToken, ReviewController.update);

// Удаление отзыва (только автор отзыва)
router.delete('/:id', authenticateToken, ReviewController.delete);

module.exports = router;