const express = require('express');
const Router = require('express').Router;
const SketchController = require('../controllers/sketchController');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Создание нового эскиза (требуется аутентификация мастера)
router.post('/', authenticateToken, upload.single('image'), SketchController.create);

// Получение списка всех эскизов
router.get('/', SketchController.findAll);

// Получение конкретного эскиза по ID
router.get('/:id', SketchController.findOne);

// Обновление эскиза (только для мастера-владельца)
router.put('/:id', authenticateToken, upload.single('image'), SketchController.update);

// Удаление эскиза (только для мастера-владельца)
router.delete('/:id', authenticateToken, SketchController.delete);

module.exports = router;