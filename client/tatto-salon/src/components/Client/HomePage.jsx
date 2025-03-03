import React, { useState, useEffect } from 'react';
import instance from '../../redux/axios';
import {
    Container,
    Tabs,
    Tab,
    Alert,
    Card,
    Row,
    Col,
    Form,
    Button,
    Image,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// Компонент для отображения рейтинга звёздами
const StarRating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return (
        <div className="star-rating">
            {Array.from({ length: fullStars }).map((_, i) => (
                <span key={`full-${i}`} style={{ color: '#ff4081', fontSize: '1.2rem' }}>
                    &#9733;
                </span>
            ))}
            {Array.from({ length: emptyStars }).map((_, i) => (
                <span key={`empty-${i}`} style={{ color: '#ccc', fontSize: '1.2rem' }}>
                    &#9733;
                </span>
            ))}
        </div>
    );
};

// Карточка мастера с увеличенным изображением
const MasterCard = ({ master, onClick }) => (
    <Col>
        <Card style={{ cursor: 'pointer' }} onClick={() => onClick(master.id)}>
            {master.photo ? (
                <Card.Img
                    variant="top"
                    src={`http://localhost:5000${master.photo}`}
                    style={{ height: '250px', objectFit: 'cover' }}
                />
            ) : (
                <Card.Img
                    variant="top"
                    src="https://via.placeholder.com/300x250?text=Нет+фото"
                    style={{ height: '250px', objectFit: 'cover' }}
                />
            )}
            <Card.Body>
                <Card.Title>
                    {master.firstName} {master.lastName}
                </Card.Title>
                <Card.Text>
                    <strong>Email:</strong> {master.email} <br />
                    <strong>Телефон:</strong> {master.phone} <br />
                    <strong>Опыт:</strong> {master.experience} лет
                </Card.Text>
                <Card.Text>{master.biography}</Card.Text>
            </Card.Body>
        </Card>
    </Col>
);

// Карточка скетча с увеличенным изображением
const SketchCard = ({ sketch, onReserve }) => (
    <Col>
        <Card>
            {sketch.image ? (
                <Card.Img
                    variant="top"
                    src={`http://localhost:5000${sketch.image}`}
                    style={{ height: '250px', objectFit: 'cover' }}
                />
            ) : (
                <Card.Img
                    variant="top"
                    src="https://via.placeholder.com/300x250?text=Нет+фото"
                    style={{ height: '250px', objectFit: 'cover' }}
                />
            )}
            <Card.Body>
                <Card.Title>{sketch.title}</Card.Title>
                <Card.Text>{sketch.description}</Card.Text>
                <Card.Text>
                    <strong>Теги:</strong> {sketch.tags}
                </Card.Text>
                <Card.Text>
                    <strong>Зарезервирован:</strong> {sketch.isReserved ? 'Да' : 'Нет'}
                </Card.Text>
                {!sketch.isReserved && (
                    <Button variant="success" onClick={() => onReserve(sketch.id)}>
                        Зарезервировать
                    </Button>
                )}
            </Card.Body>
        </Card>
    </Col>
);

// Карточка отзыва с более естественным оформлением и звездным рейтингом
const ReviewCard = ({ review, client, master }) => (
    <Col xs={12} md={6} lg={4}>
        <Card className="review-card">
            <Card.Body>
                <div className="review-header d-flex align-items-center mb-3">
                    {client && client.photo ? (
                        <Image
                            src={`http://localhost:5000${client.photo}`}
                            roundedCircle
                            style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                marginRight: '10px',
                            }}
                            alt="Аватар пользователя"
                        />
                    ) : (
                        <Image
                            src="https://via.placeholder.com/50x50?text=Нет+фото"
                            roundedCircle
                            style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                marginRight: '10px',
                            }}
                            alt="Нет аватара"
                        />
                    )}
                    <div>
                        <Card.Title className="mb-1">Отзыв #{review.id}</Card.Title>
                        <StarRating rating={review.rating} />
                    </div>
                </div>
                <Card.Text>
                    <strong>Автор:</strong>{' '}
                    {client
                        ? `${client.firstName} ${client.lastName} (${client.email})`
                        : review.clientId}
                    <br />
                    <strong>Мастер:</strong>{' '}
                    {master ? `${master.firstName} ${master.lastName}` : review.masterId}
                </Card.Text>
                <Card.Text className="review-comment" style={{ fontStyle: 'italic' }}>
                    "{review.comment}"
                </Card.Text>
            </Card.Body>
        </Card>
    </Col>
);

const HomePage = () => {
    const [masters, setMasters] = useState([]);
    const [sketches, setSketches] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [clients, setClients] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeKey, setActiveKey] = useState('masters');
    const [filterTag, setFilterTag] = useState('');
    const [onlyFree, setOnlyFree] = useState(false);
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [appointmentMasterId, setAppointmentMasterId] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchMasters();
        fetchSketches();
        fetchReviews();
        fetchClients();
    }, []);

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

    const fetchReviews = async () => {
        try {
            const response = await instance.get('/reviews');
            setReviews(response.data);
        } catch (err) {
            setError('Ошибка при получении отзывов');
        }
    };

    const fetchClients = async () => {
        try {
            const response = await instance.get('/users');
            setClients(response.data);
        } catch (err) {
            setError('Ошибка при получении списка клиентов');
        }
    };

    const reserveSketch = async (sketchId) => {
        try {
            await instance.post('/bookings', {
                bookingType: 'sketch',
                sketchId: sketchId,
            });
            setError('');
            setSuccessMessage('Эскиз успешно забронирован!');
            fetchSketches();
        } catch (err) {
            setError('Ошибка при резервировании эскиза');
            setSuccessMessage('');
        }
    };

    const getMinDateTime = () => {
        const now = new Date();
        const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        return localISOTime;
    };

    const handleAppointmentSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!appointmentMasterId || !appointmentTime) {
            setError('Заполните все поля для записи на приём');
            return;
        }
        const appointmentDate = new Date(appointmentTime);
        const now = new Date();
        if (appointmentDate <= now) {
            setError('Дата и время должны быть больше текущего времени');
            return;
        }
        const dayOfWeek = appointmentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            setError('Салон работает только по будним дням (с понедельника по пятницу)');
            return;
        }
        const hour = appointmentDate.getHours();
        if (hour < 10 || hour >= 17) {
            setError('Выберите время между 10:00 и 17:00');
            return;
        }
        try {
            await instance.post('/bookings', {
                bookingType: 'appointment',
                masterId: appointmentMasterId,
                bookingTime: appointmentTime,
            });
            setSuccessMessage('Запись на приём успешно создана!');
            setAppointmentMasterId('');
            setAppointmentTime('');
            setShowAppointmentForm(false);
        } catch (err) {
            setError('Ошибка при создании записи на приём');
            setSuccessMessage('');
        }
    };

    const filteredSketches = sketches.filter((sketch) => {
        let matchesTag = true;
        let matchesFree = true;
        if (filterTag.trim() !== '') {
            matchesTag =
                sketch.tags &&
                sketch.tags.toLowerCase().includes(filterTag.toLowerCase());
        }
        if (onlyFree) {
            matchesFree = !sketch.isReserved;
        }
        return matchesTag && matchesFree;
    });

    const handleMasterClick = (masterId) => {
        navigate(`/master-details/${masterId}`);
    };

    return (
        <Container className="mt-4 home-page">
            <h1 className="mb-4">Добро пожаловать в Tatoo Salon</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <Button
                className="mb-3"
                onClick={() => setShowAppointmentForm(!showAppointmentForm)}
            >
                {showAppointmentForm ? 'Скрыть форму записи' : 'Записаться'}
            </Button>

            {showAppointmentForm && (
                <Form onSubmit={handleAppointmentSubmit} className="mb-4">
                    <Form.Group controlId="appointmentMaster" className="mb-3">
                        <Form.Label>Выберите мастера</Form.Label>
                        <Form.Control
                            as="select"
                            value={appointmentMasterId}
                            onChange={(e) => setAppointmentMasterId(e.target.value)}
                        >
                            <option value="">-- Выберите мастера --</option>
                            {masters.map((master) => (
                                <option key={master.id} value={master.id}>
                                    {master.firstName} {master.lastName}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="appointmentTime" className="mb-3">
                        <Form.Label>Дата и время приёма</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={appointmentTime}
                            onChange={(e) => setAppointmentTime(e.target.value)}
                            min={getMinDateTime()}
                        />
                        <Form.Text className="text-muted">
                            Салон работает по будним дням с 10:00 до 17:00.
                        </Form.Text>
                    </Form.Group>
                    <Button type="submit" variant="primary">
                        Создать запись на приём
                    </Button>
                </Form>
            )}

            <Tabs
                activeKey={activeKey}
                onSelect={(k) => setActiveKey(k)}
                className="mb-3"
            >
                <Tab eventKey="masters" title="Мастера">
                    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                        {masters.length > 0 ? (
                            masters.map((master) => (
                                <MasterCard
                                    key={master.id}
                                    master={master}
                                    onClick={handleMasterClick}
                                />
                            ))
                        ) : (
                            <Col>
                                <Alert variant="info">Нет мастеров</Alert>
                            </Col>
                        )}
                    </Row>
                </Tab>
                <Tab eventKey="sketches" title="Скетчи">
                    <Form className="mb-3">
                        <Row className="align-items-center">
                            <Col xs="12" md="6">
                                <Form.Control
                                    type="text"
                                    placeholder="Поиск по тегам"
                                    value={filterTag}
                                    onChange={(e) => setFilterTag(e.target.value)}
                                />
                            </Col>
                            <Col xs="12" md="6">
                                <Form.Check
                                    type="checkbox"
                                    label="Показать только свободные эскизы"
                                    checked={onlyFree}
                                    onChange={(e) => setOnlyFree(e.target.checked)}
                                />
                            </Col>
                        </Row>
                    </Form>
                    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                        {filteredSketches.length > 0 ? (
                            filteredSketches.map((sketch) => (
                                <SketchCard
                                    key={sketch.id}
                                    sketch={sketch}
                                    onReserve={reserveSketch}
                                />
                            ))
                        ) : (
                            <Col>
                                <Alert variant="info">Нет скетчей</Alert>
                            </Col>
                        )}
                    </Row>
                </Tab>
                <Tab eventKey="reviews" title="Отзывы">
                    <Row className="g-4">
                        {reviews.length > 0 ? (
                            reviews.map((review) => {
                                const client = clients.find((c) => c.id === review.clientId);
                                const master = masters.find((m) => m.id === review.masterId);
                                return (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        client={client}
                                        master={master}
                                    />
                                );
                            })
                        ) : (
                            <Alert variant="info">Нет отзывов</Alert>
                        )}
                    </Row>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default HomePage;
