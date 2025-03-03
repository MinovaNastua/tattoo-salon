const express = require('express');
const Router = require('express').Router;
const PortfolioPhotoController = require('../controllers/portfolioPhotoController');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Создание нового фото портфолио (только для мастера)
router.post('/', authenticateToken, upload.single('image'), PortfolioPhotoController.create);

// Получение списка всех фото портфолио
router.get('/', PortfolioPhotoController.findAll);

// Получение конкретного фото портфолио по ID
router.get('/:id', PortfolioPhotoController.findOne);

// Обновление фото портфолио (только для владельца)
router.put('/:id', authenticateToken, upload.single('image'), PortfolioPhotoController.update);

// Удаление фото портфолио (только для владельца)
router.delete('/:id', authenticateToken, PortfolioPhotoController.delete);

module.exports = router;