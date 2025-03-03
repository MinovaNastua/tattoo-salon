const { BlogPost, BlogPostLike } = require('../models/models');

class BlogPostController {
    // Создание записи блога (доступно только администратору)
    async create(req, res) {
        try {
            const adminId = req.user.adminId;
            if (!adminId) {
                return res.status(403).json({ message: 'Нет прав для создания записи блога' });
            }

            const { title, content, published } = req.body;
            // Если запись публикуется сразу, устанавливаем дату публикации
            const publishedAt = published ? new Date() : null;

            const blogPost = await BlogPost.create({
                title,
                content,
                published,
                publishedAt,
                adminId,
                // likes будет установлено в 0 по умолчанию
            });

            res.status(201).json(blogPost);
        } catch (error) {
            console.error('Ошибка при создании записи блога:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение записи блога по ID
    async findOne(req, res) {
        try {
            const blogPost = await BlogPost.findByPk(req.params.id);
            if (!blogPost) {
                return res.status(404).json({ message: 'Запись блога не найдена' });
            }
            res.json(blogPost);
        } catch (error) {
            console.error('Ошибка при получении записи блога:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получение списка всех записей блога
    async findAll(req, res) {
        try {
            const blogPosts = await BlogPost.findAll();
            res.json(blogPosts);
        } catch (error) {
            console.error('Ошибка при получении записей блога:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Обновление записи блога (только автор записи, то есть администратор, который её создал)
    async update(req, res) {
        try {
            const blogPostId = req.params.id;
            const adminId = req.user.adminId;
            if (!adminId) {
                return res.status(403).json({ message: 'Нет прав для обновления записи блога' });
            }

            const blogPost = await BlogPost.findByPk(blogPostId);
            if (!blogPost) {
                return res.status(404).json({ message: 'Запись блога не найдена' });
            }

            if (blogPost.adminId !== adminId) {
                return res.status(403).json({ message: 'Вы не можете обновлять эту запись блога' });
            }

            const { title, content, published } = req.body;
            // Если запись публикуется, устанавливаем дату публикации (если ещё не установлена)
            let publishedAt = blogPost.publishedAt;
            if (published && !publishedAt) {
                publishedAt = new Date();
            }

            // Обновление полей, likes остаётся неизменным
            await blogPost.update({ title, content, published, publishedAt });
            res.json(blogPost);
        } catch (error) {
            console.error('Ошибка при обновлении записи блога:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Удаление записи блога (только автор записи)
    async delete(req, res) {
        try {
            const blogPostId = req.params.id;
            const adminId = req.user.adminId;
            if (!adminId) {
                return res.status(403).json({ message: 'Нет прав для удаления записи блога' });
            }

            const blogPost = await BlogPost.findByPk(blogPostId);
            if (!blogPost) {
                return res.status(404).json({ message: 'Запись блога не найдена' });
            }

            if (blogPost.adminId !== adminId) {
                return res.status(403).json({ message: 'Вы не можете удалять эту запись блога' });
            }

            await blogPost.destroy();
            res.status(200).json({ message: 'Запись блога успешно удалена' });
        } catch (error) {
            console.error('Ошибка при удалении записи блога:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async like(req, res) {
        try {
            const blogPostId = req.params.id;
            const userId = req.user.userId; // предполагается, что в токене хранится userId
            const blogPost = await BlogPost.findByPk(blogPostId);
            if (!blogPost) {
                return res.status(404).json({ message: 'Запись блога не найдена' });
            }
            // Проверяем, поставил ли уже пользователь лайк
            const existingLike = await BlogPostLike.findOne({ where: { blogPostId, userId } });
            if (existingLike) {
                return res.status(400).json({ message: 'Вы уже поставили лайк' });
            }
            // Создаем запись лайка
            await BlogPostLike.create({ blogPostId, userId });
            // Увеличиваем счетчик лайков
            blogPost.likes += 1;
            await blogPost.save();
            res.json(blogPost);
        } catch (error) {
            console.error('Ошибка при постановке лайка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async unlike(req, res) {
        try {
            const blogPostId = req.params.id;
            const userId = req.user.userId;
            const blogPost = await BlogPost.findByPk(blogPostId);
            if (!blogPost) {
                return res.status(404).json({ message: 'Запись блога не найдена' });
            }
            // Проверяем, поставлен ли лайк этим пользователем
            const existingLike = await BlogPostLike.findOne({ where: { blogPostId, userId } });
            if (!existingLike) {
                return res.status(400).json({ message: 'Лайк не найден' });
            }
            await existingLike.destroy();
            // Уменьшаем счетчик лайков, не опуская его ниже 0
            blogPost.likes = Math.max(0, blogPost.likes - 1);
            await blogPost.save();
            res.json(blogPost);
        } catch (error) {
            console.error('Ошибка при удалении лайка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new BlogPostController();
