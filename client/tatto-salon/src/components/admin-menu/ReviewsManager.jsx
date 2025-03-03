import React, { useState, useEffect } from 'react';
import instance from '../../redux/axios';
import { Container, Alert, Card, Button, Row, Col } from 'react-bootstrap';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [masters, setMasters] = useState([]);
    const [clients, setClients] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        fetchReviews();
        fetchMasters();
        fetchClients();
    };

    const fetchReviews = async () => {
        try {
            const response = await instance.get('/reviews');
            setReviews(response.data);
            setError('');
        } catch (err) {
            setError('Ошибка при получении отзывов');
        }
    };

    const fetchMasters = async () => {
        try {
            const response = await instance.get('/masters');
            setMasters(response.data);
        } catch (err) {
            setError('Ошибка при получении списка мастеров');
        }
    };

    const fetchClients = async () => {
        try {
            // Предполагается, что данные клиентов доступны по эндпоинту '/users'
            const response = await instance.get('/users');
            setClients(response.data);
        } catch (err) {
            setError('Ошибка при получении списка клиентов');
        }
    };

    const handleDelete = async (reviewId) => {
        try {
            await instance.delete(`/reviews/${reviewId}`);
            setSuccessMessage('Отзыв успешно удалён');
            fetchReviews();
        } catch (err) {
            setError('Ошибка при удалении отзыва');
        }
    };

    return (
        <Container className="mt-4">
            <h1>Управление отзывами (админ)</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {reviews.length === 0 ? (
                <Alert variant="info">Нет отзывов</Alert>
            ) : (
                <Row className="g-4">
                    {reviews.map((review) => {
                        const client = clients.find((c) => c.id === review.clientId);
                        const master = masters.find((m) => m.id === review.masterId);
                        return (
                            <Col key={review.id} xs={12} md={6} lg={4}>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>Отзыв #{review.id}</Card.Title>
                                        <Card.Text>
                                            <strong>Автор:</strong>{' '}
                                            {client
                                                ? `${client.firstName} ${client.lastName} (${client.email})`
                                                : review.clientId}
                                            <br />
                                            <strong>Мастер:</strong>{' '}
                                            {master
                                                ? `${master.firstName} ${master.lastName}`
                                                : review.masterId}
                                            <br />
                                            <strong>Рейтинг:</strong> {review.rating} <br />
                                            <strong>Комментарий:</strong> {review.comment}
                                        </Card.Text>
                                        <Button variant="danger" onClick={() => handleDelete(review.id)}>
                                            Удалить отзыв
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </Container>
    );
};

export default AdminReviews;
