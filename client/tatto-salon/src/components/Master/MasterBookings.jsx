import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import instance from '../../redux/axios';
import { Container, Alert, Card, ListGroup } from 'react-bootstrap';
import './MasterCalendar.css'; // Для дополнительного CSS, например, выделения дней

const MasterCalendarBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [clients, setClients] = useState([]);
    const [sketches, setSketches] = useState([]);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [bookingsByDate, setBookingsByDate] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        fetchBookings();
        fetchClients();
        fetchSketches();
    };

    const fetchBookings = async () => {
        try {
            // Предполагается, что API возвращает только записи для текущего мастера
            const response = await instance.get('/bookings');
            setBookings(response.data);
            setError('');
            groupBookingsByDate(response.data);
        } catch (err) {
            setError('Ошибка при получении записей');
        }
    };

    const fetchClients = async () => {
        try {
            // Эндпоинт /users возвращает данные клиентов
            const response = await instance.get('/users');
            setClients(response.data);
        } catch (err) {
            setError('Ошибка при получении списка клиентов');
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

    // Группируем записи по дате (используем toDateString для сравнения)
    const groupBookingsByDate = (bookings) => {
        const grouped = {};
        bookings.forEach((booking) => {
            if (booking.bookingTime) {
                const dateStr = new Date(booking.bookingTime).toDateString();
                if (!grouped[dateStr]) {
                    grouped[dateStr] = [];
                }
                grouped[dateStr].push(booking);
            }
        });
        setBookingsByDate(grouped);
    };

    // Функция для выделения дней с записями в календаре
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = date.toDateString();
            if (bookingsByDate[dateStr]) {
                return 'has-bookings';
            }
        }
        return null;
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const selectedDateBookings = selectedDate
        ? bookingsByDate[selectedDate.toDateString()] || []
        : [];

    return (
        <Container className="mt-4">
            <h1>Календарь записей</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileClassName={tileClassName}
            />
            {selectedDate && (
                <Card className="mt-4">
                    <Card.Header>
                        Записи на {selectedDate.toLocaleDateString()} (Всего: {selectedDateBookings.length})
                    </Card.Header>
                    {selectedDateBookings.length === 0 ? (
                        <Card.Body>
                            <Alert variant="info">На выбранный день записей нет</Alert>
                        </Card.Body>
                    ) : (
                        <ListGroup variant="flush">
                            {selectedDateBookings.map((booking) => (
                                <ListGroup.Item key={booking.id}>
                                    <div>
                                        <strong>Запись #{booking.id}</strong> – <br />
                                        <strong>Тип:</strong> {booking.bookingType} <br />
                                        <strong>Статус:</strong> {booking.status} <br />
                                        <strong>Клиент:</strong>{' '}
                                        {(() => {
                                            const client = clients.find((c) => c.id === booking.clientId);
                                            return client
                                                ? `${client.firstName} ${client.lastName} (${client.email})`
                                                : booking.clientId;
                                        })()}
                                        <br />
                                        {booking.bookingType === 'appointment' ? (
                                            <>
                                                <strong>Время записи:</strong> {booking.bookingTime}
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
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Card>
            )}
        </Container>
    );
};

export default MasterCalendarBookings;
