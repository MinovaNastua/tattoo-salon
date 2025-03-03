import React, { useState, useEffect } from 'react';
import instance from '../../redux/axios'; // настроенный axios
import { Container, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';

const BlogPostManager = () => {
    const [blogPosts, setBlogPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // по умолчанию: сначала новые
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        published: false,
    });
    const [editing, setEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Загрузка всех записей блога
    useEffect(() => {
        fetchBlogPosts();
    }, []);

    const fetchBlogPosts = async () => {
        try {
            const response = await instance.get('/blogposts'); // endpoint для получения записей
            setBlogPosts(response.data);
        } catch (err) {
            setError('Ошибка при получении записей блога');
        }
    };

    // Фильтрация по ключевым словам в заголовке и содержимом
    const filteredPosts = blogPosts.filter(post => {
        const query = searchQuery.toLowerCase();
        return (
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query)
        );
    });

    // Сортировка по дате публикации (если publishedAt отсутствует — ставим 0)
    const sortedPosts = filteredPosts.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt) : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt) : 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Функция для получения короткого описания (например, первые 200 символов)
    const getExcerpt = (content) => {
        const maxLength = 200;
        return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    };

    // Обработчик изменения полей формы
    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    // Обработчик отправки формы для создания/редактирования записи
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (editing) {
            // Режим редактирования: обновление записи
            try {
                await instance.put(`/blogposts/${editingId}`, formData);
                setMessage('Запись обновлена успешно');
                setEditing(false);
                setEditingId(null);
                setFormData({ title: '', content: '', published: false });
                fetchBlogPosts();
            } catch (err) {
                setError('Ошибка при обновлении записи блога');
            }
        } else {
            // Создание новой записи
            try {
                await instance.post('/blogposts', formData);
                setMessage('Запись создана успешно');
                setFormData({ title: '', content: '', published: false });
                fetchBlogPosts();
            } catch (err) {
                setError('Ошибка при создании записи блога');
            }
        }
    };

    // Заполнение формы для редактирования записи
    const handleEdit = (post) => {
        setEditing(true);
        setEditingId(post.id);
        setFormData({
            title: post.title,
            content: post.content,
            published: post.published,
        });
        setMessage('');
        setError('');
    };

    // Удаление записи блога
    const handleDelete = async (id) => {
        setMessage('');
        setError('');
        try {
            await instance.delete(`/blogposts/${id}`);
            setMessage('Запись удалена успешно');
            fetchBlogPosts();
        } catch (err) {
            setError('Ошибка при удалении записи блога');
        }
    };

    return (
        <Container className="mt-4">
            <Row className="mb-4">
                <Col>
                    <h2>Список записей блога</h2>
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Заголовок</th>
                                <th>Контент</th>
                                <th>Опубликована</th>
                                <th>Дата публикации</th>
                                <th>Лайки</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPosts.map((post) => (
                                <tr key={post.id}>
                                    <td>{post.id}</td>
                                    <td>{post.title}</td>
                                    <td>{post.content}</td>
                                    <td>{post.published ? 'Да' : 'Нет'}</td>
                                    <td>
                                        {post.publishedAt
                                            ? new Date(post.publishedAt).toLocaleString()
                                            : '-'}
                                    </td>
                                    <td>{post.likes || 0}</td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleEdit(post)}
                                        >
                                            Редактировать
                                        </Button>{' '}
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(post.id)}
                                        >
                                            Удалить
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {blogPosts.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        Нет записей
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <h2>{editing ? 'Редактирование записи' : 'Создание новой записи'}</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formTitle">
                            <Form.Label>Заголовок</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                placeholder="Введите заголовок"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formContent">
                            <Form.Label>Контент</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="content"
                                placeholder="Введите контент"
                                value={formData.content}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formPublished">
                            <Form.Check
                                type="checkbox"
                                label="Опубликована"
                                name="published"
                                checked={formData.published}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Button variant="success" type="submit">
                            {editing ? 'Обновить запись' : 'Создать запись'}
                        </Button>{' '}
                        {editing && (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setEditing(false);
                                    setEditingId(null);
                                    setFormData({ title: '', content: '', published: false });
                                    setMessage('');
                                    setError('');
                                }}
                            >
                                Отмена
                            </Button>
                        )}
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default BlogPostManager;
