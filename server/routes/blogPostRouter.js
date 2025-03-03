const express = require('express');
const Router = express.Router;
const BlogPostController = require('../controllers/blogPostController');
const authenticateToken = require('../middleware/authenticateToken');

const router = Router();

// Создание записи блога (только для администраторов)
router.post('/', authenticateToken, BlogPostController.create);

// Получение списка всех записей блога (публично)
router.get('/', BlogPostController.findAll);

// Получение конкретной записи блога по ID (публично)
router.get('/:id', BlogPostController.findOne);

// Обновление записи блога (только для автора записи)
router.put('/:id', authenticateToken, BlogPostController.update);

// Удаление записи блога (только для автора записи)
router.delete('/:id', authenticateToken, BlogPostController.delete);

// Маршруты для лайка
router.post('/:id/like', authenticateToken, BlogPostController.like);
router.delete('/:id/like', authenticateToken, BlogPostController.unlike);

module.exports = router;
