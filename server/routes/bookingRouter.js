const express = require('express');
const Router = require('express').Router;
const BookingController = require('../controllers/bookingController');
const authenticateToken = require('../middleware/authenticateToken');

const router = Router();

// Создание нового бронирования (резервация эскиза или запись на приём)
// Доступно только авторизованным клиентам
router.post('/', authenticateToken, BookingController.create);

// Получение списка бронирований для текущего пользователя (клиента или мастера)
router.get('/', authenticateToken, BookingController.findAll);

// Получение конкретного бронирования по ID
router.get('/:id', authenticateToken, BookingController.findOne);

// Обновление бронирования (например, изменение статуса или времени)
router.put('/:id', authenticateToken, BookingController.update);

// Удаление бронирования
router.delete('/:id', authenticateToken, BookingController.delete);

module.exports = router;