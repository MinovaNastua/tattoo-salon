import React, { useState, useEffect } from 'react';
import instance from '../../redux/axios';
import {
    Container,
    Alert,
    Card,
    Form,
    Button,
    Row,
    Col,
    Modal,
} from 'react-bootstrap';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [masters, setMasters] = useState([]);
    const [sketches, setSketches] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    // Состояния для редактирования записи (appointment)
    const [editingBookingId, setEditingBookingId] = useState(null);
    const [newBookingTime, setNewBookingTime] = useState('');
    // Состояния для модального окна отзыва
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [currentReviewBooking, setCurrentReviewBooking] = useState(null);

    useEffect(() => {
        fetchBookings();
        fetchMasters();
        fetchSketches();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await instance.get('/bookings');
            setBookings(response.data);
            setError('');
        } catch (err) {
            setError('Ошибка при получении бронирований');
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

    const fetchSketches = async () => {
        try {
            const response = await instance.get('/sketches');
            setSketches(response.data);
        } catch (err) {
            setError('Ошибка при получении списка скетчей');
        }
    };

    const handleDelete = async (bookingId) => {
        try {
            await instance.delete(`/bookings/${bookingId}`);
            setSuccessMessage('Бронирование успешно удалено');
            fetchBookings();
        } catch (err) {
            setError('Ошибка при удалении бронирования');
        }
    };

    const handleEdit = (booking) => {
        setEditingBookingId(booking.id);
        setNewBookingTime(booking.bookingTime ? booking.bookingTime.slice(0, 16) : '');
    };

    const handleUpdate = async (bookingId) => {
        try {
            await instance.put(`/bookings/${bookingId}`, { bookingTime: newBookingTime });
            setSuccessMessage('Бронирование успешно обновлено');
            setEditingBookingId(null);
            setNewBookingTime('');
            fetchBookings();
        } catch (err) {
            setError('Ошибка при обновлении бронирования');
        }
    };

    // Открытие модального окна для отзыва
    const openReviewModal = (booking) => {
        setCurrentReviewBooking(booking);
        setReviewRating('');
        setReviewComment('');
        setShowReviewModal(true);
    };

    // Отправка отзыва
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!currentReviewBooking) return;
        try {
            await instance.post('/reviews', {
                rating: reviewRating,
                comment: reviewComment,
                masterId: currentReviewBooking.masterId,
            });
            setSuccessMessage('Отзыв успешно оставлен');
            setShowReviewModal(false);
        } catch (err) {
            setError('Ошибка при отправке отзыва');
        }
    };

    return (
        <Container className="mt-4">
            <h1>Мои бронирования</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {bookings.length === 0 ? (
                <Alert variant="info">Нет бронирований</Alert>
            ) : (
                bookings.map((booking) => {
                    return (
                        <Card key={booking.id} className="mb-3">
                            <Card.Body>
                                <Card.Title>Бронирование #{booking.id}</Card.Title>
                                <Card.Text>
                                    <strong>Тип бронирования:</strong> {booking.bookingType} <br />
                                    <strong>Статус:</strong> {booking.status} <br />
                                    {booking.bookingType === 'appointment' ? (
                                        <>
                                            {(() => {
                                                const master = masters.find((m) => m.id === booking.masterId);
                                                return master ? (
                                                    <>
                                                        <strong>Мастер:</strong> {master.firstName} {master.lastName} <br />
                                                        {master.photo ? (
                                                            <img
                                                                src={`http://localhost:5000${master.photo}`}
                                                                alt={`${master.firstName} ${master.lastName}`}
                                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <span>Фото отсутствует</span>
                                                        )}
                                                        <br />
                                                        <strong>Время записи:</strong> {booking.bookingTime}
                                                    </>
                                                ) : (
                                                    <>
                                                        <strong>Мастер ID:</strong> {booking.masterId} <br />
                                                        <strong>Время записи:</strong> {booking.bookingTime}
                                                    </>
                                                );
                                            })()}
                                        </>
                                    ) : (
                                        <>
                                            {(() => {
                                                const sketch = sketches.find((s) => s.id === booking.sketchId);
                                                return sketch ? (
                                                    <Card className="mt-2">
                                                        {sketch.image ? (
                                                            <Card.Img
                                                                variant="top"
                                                                src={`http://localhost:5000${sketch.image}`}
                                                                style={{ height: '150px', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <Card.Img
                                                                variant="top"
                                                                src="https://via.placeholder.com/300x150?text=Нет+фото"
                                                                style={{ height: '150px', objectFit: 'cover' }}
                                                            />
                                                        )}
                                                        <Card.Body>
                                                            <Card.Title>{sketch.title}</Card.Title>
                                                            <Card.Text>{sketch.description}</Card.Text>
                                                            <Card.Text>
                                                                <strong>Теги:</strong> {sketch.tags}
                                                            </Card.Text>
                                                        </Card.Body>
                                                    </Card>
                                                ) : (
                                                    <span>Информация по эскизу не найдена</span>
                                                );
                                            })()}
                                        </>
                                    )}
                                </Card.Text>
                                <Row>
                                    <Col xs="auto">
                                        <Button variant="danger" onClick={() => handleDelete(booking.id)}>
                                            Отменить бронирование
                                        </Button>
                                    </Col>
                                    {booking.bookingType === 'appointment' && booking.status === 'pending' && (
                                        <Col xs="auto">
                                            <Button variant="secondary" onClick={() => handleEdit(booking)}>
                                                Редактировать
                                            </Button>
                                        </Col>
                                    )}
                                    {/* Если тип appointment и статус confirmed - показываем кнопку оставить отзыв */}
                                    {booking.bookingType === 'appointment' && booking.status === 'confirmed' && (
                                        <Col xs="auto">
                                            <Button variant="success" onClick={() => openReviewModal(booking)}>
                                                Оставить отзыв
                                            </Button>
                                        </Col>
                                    )}
                                </Row>
                                {booking.bookingType === 'appointment' &&
                                    booking.status === 'pending' &&
                                    editingBookingId === booking.id && (
                                        <Form className="mt-3">
                                            <Form.Group controlId={`editTime-${booking.id}`}>
                                                <Form.Label>Новое время записи</Form.Label>
                                                <Form.Control
                                                    type="datetime-local"
                                                    value={newBookingTime}
                                                    onChange={(e) => setNewBookingTime(e.target.value)}
                                                />
                                            </Form.Group>
                                            <Button variant="primary" className="mt-2" onClick={() => handleUpdate(booking.id)}>
                                                Сохранить
                                            </Button>
                                        </Form>
                                    )}
                            </Card.Body>
                        </Card>
                    );
                })
            )}

            {/* Модальное окно для создания отзыва */}
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Оставить отзыв</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleReviewSubmit}>
                    <Modal.Body>
                        <Form.Group controlId="reviewRating">
                            <Form.Label>Рейтинг (от 1 до 5)</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                max="5"
                                value={reviewRating}
                                onChange={(e) => setReviewRating(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="reviewComment" className="mt-3">
                            <Form.Label>Комментарий</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
                            Отмена
                        </Button>
                        <Button variant="primary" type="submit">
                            Отправить отзыв
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default MyBookings;