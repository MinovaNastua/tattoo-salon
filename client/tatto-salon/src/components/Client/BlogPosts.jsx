import React, { useState, useEffect } from 'react';
import instance from '../../redux/axios'; // настроенный axios
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Card,
    Alert,
} from 'react-bootstrap';

const BlogPosts = () => {
    const [blogPosts, setBlogPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // по умолчанию: сначала новые
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    // Состояние для отслеживания, какие посты уже лайкнуты текущим пользователем
    const [likedPosts, setLikedPosts] = useState({}); // ключ: post.id, значение: true/false

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
    const filteredPosts = blogPosts.filter((post) => {
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

    // Функция переключения лайка
    const toggleLike = async (postId) => {
        // Если пост уже лайкнут, убираем лайк
        if (likedPosts[postId]) {
            try {
                await instance.delete(`/blogposts/${postId}/like`);
                setLikedPosts((prev) => ({ ...prev, [postId]: false }));
                // Оптимистично обновляем количество лайков
                setBlogPosts((prev) =>
                    prev.map((post) =>
                        post.id === postId ? { ...post, likes: post.likes - 1 } : post
                    )
                );
            } catch (err) {
                console.error('Ошибка при удалении лайка');
            }
        } else {
            // Если пост не лайкнут, ставим лайк
            try {
                await instance.post(`/blogposts/${postId}/like`);
                setLikedPosts((prev) => ({ ...prev, [postId]: true }));
                setBlogPosts((prev) =>
                    prev.map((post) =>
                        post.id === postId ? { ...post, likes: post.likes + 1 } : post
                    )
                );
            } catch (err) {
                console.error('Ошибка при постановке лайка');
            }
        }
    };

    return (
        <Container className="blog-container">
            <Row className="mb-4">
                <Col>
                    <h1 className="mb-3">Блог</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {message && <Alert variant="success">{message}</Alert>}
                </Col>
            </Row>
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="Поиск по ключевым словам"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Col>
                <Col md={3}>
                    <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="desc">Сначала новые</option>
                        <option value="asc">Сначала старые</option>
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Button variant="primary" onClick={fetchBlogPosts}>
                        Обновить
                    </Button>
                </Col>
            </Row>
            <Row className="g-4">
                {sortedPosts.length > 0 ? (
                    sortedPosts.map((post) => (
                        <Col key={post.id} md={6} lg={4}>
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <Card.Title>{post.title}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        {post.publishedAt
                                            ? new Date(post.publishedAt).toLocaleDateString()
                                            : 'Не опубликовано'}
                                    </Card.Subtitle>
                                    <Card.Text>{getExcerpt(post.content)}</Card.Text>
                                </Card.Body>
                                <Card.Footer className="d-flex justify-content-between align-items-center">
                                    <Button variant="outline-primary" size="sm">
                                        Читать далее
                                    </Button>
                                    <div>
                                        <Button
                                            variant={likedPosts[post.id] ? 'success' : 'outline-secondary'}
                                            size="sm"
                                            onClick={() => toggleLike(post.id)}
                                        >
                                            {likedPosts[post.id] ? 'Убрать лайк' : 'Лайк'}
                                        </Button>
                                        <span className="ms-2">{post.likes || 0}</span>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col>
                        <Alert variant="info">Нет записей блога</Alert>
                    </Col>
                )}
            </Row>
        </Container>
    );
};

export default BlogPosts;
