import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import instance from '../../redux/axios';
import {
    Container,
    Alert,
    Card,
    Form,
    Button,
    Row,
    Col,
    ListGroup,
} from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
    Document,
    Packer,
    Paragraph,
    Table as DocxTable,
    TableCell,
    TableRow,
} from 'docx';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [masters, setMasters] = useState([]);
    const [sketches, setSketches] = useState([]);
    const [clients, setClients] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    // Состояния для редактирования бронирования
    const [editingBookingId, setEditingBookingId] = useState(null);
    const [newBookingTime, setNewBookingTime] = useState('');
    const [newStatus, setNewStatus] = useState('');
    // Фильтры
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [searchMaster, setSearchMaster] = useState('');
    const [searchClient, setSearchClient] = useState('');
    // Дополнительный фильтр по календарю
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        fetchBookings();
        fetchMasters();
        fetchSketches();
        fetchClients();
    };

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

    const fetchClients = async () => {
        try {
            // Предполагается, что данные клиентов доступны по эндпоинту '/users'
            const response = await instance.get('/users');
            setClients(response.data);
        } catch (err) {
            setError('Ошибка при получении списка клиентов');
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
        setNewStatus(booking.status);
    };

    const handleUpdate = async (bookingId) => {
        try {
            await instance.put(`/bookings/${bookingId}`, {
                bookingTime: newBookingTime,
                status: newStatus,
            });
            setSuccessMessage('Бронирование успешно обновлено');
            setEditingBookingId(null);
            setNewBookingTime('');
            setNewStatus('');
            fetchBookings();
        } catch (err) {
            setError('Ошибка при обновлении бронирования');
        }
    };

    // Фильтрация заявок согласно выбранным параметрам + календарь
    const filteredBookings = bookings.filter((booking) => {
        // Фильтр по календарю: если выбрана дата, проверяем, что время записи попадает в эту дату
        if (selectedDate && booking.bookingTime) {
            const bookingDate = new Date(booking.bookingTime).toDateString();
            if (bookingDate !== selectedDate.toDateString()) return false;
        }
        // Фильтр по статусу
        if (filterStatus !== 'all' && booking.status !== filterStatus) {
            return false;
        }
        // Фильтр по типу
        if (filterType !== 'all' && booking.bookingType !== filterType) {
            return false;
        }
        // Поиск по мастеру (только для appointment)
        if (searchMaster.trim() !== '' && booking.bookingType === 'appointment') {
            const master = masters.find((m) => m.id === booking.masterId);
            if (!master) return false;
            const fullName = `${master.firstName} ${master.lastName}`.toLowerCase();
            if (!fullName.includes(searchMaster.toLowerCase())) return false;
        }
        // Поиск по клиенту
        if (searchClient.trim() !== '') {
            const client = clients.find((c) => c.id === booking.clientId);
            if (!client) return false;
            const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
            if (!fullName.includes(searchClient.toLowerCase())) return false;
        }
        return true;
    });

    // Для календаря: выделяем дни, на которые приходятся хотя бы одна запись
    const getTileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = date.toDateString();
            const hasBooking = bookings.some(
                (booking) =>
                    booking.bookingTime &&
                    new Date(booking.bookingTime).toDateString() === dateStr
            );
            return hasBooking ? 'has-bookings' : null;
        }
        return null;
    };

    // Экспорт данных бронирований в Excel
    const exportToExcel = () => {
        const data = filteredBookings.map((booking) => {
            const client = clients.find((c) => c.id === booking.clientId);
            const clientInfo = client
                ? `${client.firstName} ${client.lastName} (${client.email})`
                : booking.clientId;
            let extraInfo = '';
            if (booking.bookingType === 'appointment') {
                const master = masters.find((m) => m.id === booking.masterId);
                extraInfo = master
                    ? `${master.firstName} ${master.lastName}`
                    : booking.masterId;
            } else if (booking.bookingType === 'sketch') {
                const sketch = sketches.find((s) => s.id === booking.sketchId);
                extraInfo = sketch ? sketch.title : booking.sketchId;
            }
            return {
                ID: booking.id,
                Тип: booking.bookingType,
                Статус: booking.status,
                Клиент: clientInfo,
                Дополнительно: extraInfo,
                'Время записи': booking.bookingTime || '',
            };
        });
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, 'bookings_report.xlsx');
    };

    // Экспорт данных бронирований в DOCX
    const exportToDocx = async () => {
        const tableHeaders = [
            'ID',
            'Тип',
            'Статус',
            'Клиент',
            'Дополнительно',
            'Время записи',
        ];

        const tableRows = filteredBookings.map((booking) => {
            const client = clients.find((c) => c.id === booking.clientId);
            const clientInfo = client
                ? `${client.firstName} ${client.lastName} (${client.email})`
                : booking.clientId;
            let extraInfo = '';
            if (booking.bookingType === 'appointment') {
                const master = masters.find((m) => m.id === booking.masterId);
                extraInfo = master
                    ? `${master.firstName} ${master.lastName}`
                    : booking.masterId;
            } else if (booking.bookingType === 'sketch') {
                const sketch = sketches.find((s) => s.id === booking.sketchId);
                extraInfo = sketch ? sketch.title : booking.sketchId;
            }
            return new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(booking.id.toString())] }),
                    new TableCell({ children: [new Paragraph(booking.bookingType)] }),
                    new TableCell({ children: [new Paragraph(booking.status)] }),
                    new TableCell({ children: [new Paragraph(clientInfo)] }),
                    new TableCell({ children: [new Paragraph(extraInfo)] }),
                    new TableCell({ children: [new Paragraph(booking.bookingTime || '')] }),
                ],
            });
        });

        const headerRow = new TableRow({
            children: tableHeaders.map((header) =>
                new TableCell({
                    children: [new Paragraph({ text: header, bold: true })],
                })
            ),
        });

        const table = new DocxTable({
            rows: [headerRow, ...tableRows],
        });

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({ text: 'Отчет по бронированиям', heading: 'Heading1' }),
                        table,
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, 'bookings_report.docx');
    };

    return (
        <Container className="mt-4">
            <h1>Управление бронированиями (админ)</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            {/* Календарь для сортировки по дате */}
            <Row className="mb-3">
                <Col>
                    <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        tileClassName={getTileClassName}
                    />
                </Col>
            </Row>

            {/* Фильтры */}
            <Card className="mb-3 p-3">
                <Form>
                    <Row className="align-items-center">
                        <Col md={3} className="mb-2">
                            <Form.Label>Статус</Form.Label>
                            <Form.Control
                                as="select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Все</option>
                                <option value="pending">pending</option>
                                <option value="confirmed">confirmed</option>
                                <option value="cancelled">cancelled</option>
                            </Form.Control>
                        </Col>
                        <Col md={3} className="mb-2">
                            <Form.Label>Тип</Form.Label>
                            <Form.Control
                                as="select"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">Все</option>
                                <option value="appointment">Запись на приём</option>
                                <option value="sketch">Бронирование эскиза</option>
                            </Form.Control>
                        </Col>
                        <Col md={3} className="mb-2">
                            <Form.Label>Поиск по мастеру</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Имя мастера"
                                value={searchMaster}
                                onChange={(e) => setSearchMaster(e.target.value)}
                            />
                        </Col>
                        <Col md={3} className="mb-2">
                            <Form.Label>Поиск по клиенту</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Имя клиента"
                                value={searchClient}
                                onChange={(e) => setSearchClient(e.target.value)}
                            />
                        </Col>
                    </Row>
                </Form>
            </Card>

            {/* Экспорт отчётов */}
            <Row className="mb-3">
                <Col>
                    <Button variant="success" onClick={exportToExcel} className="me-2">
                        Экспорт в Excel
                    </Button>
                    <Button variant="info" onClick={exportToDocx}>
                        Экспорт в DOCX
                    </Button>
                </Col>
            </Row>

            {filteredBookings.length === 0 ? (
                <Alert variant="info">Нет бронирований</Alert>
            ) : (
                filteredBookings.map((booking) => (
                    <Card key={booking.id} className="mb-3">
                        <Card.Body>
                            <Card.Title>Бронирование #{booking.id}</Card.Title>
                            <Card.Text>
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
                                        Удалить
                                    </Button>
                                </Col>
                                <Col xs="auto">
                                    <Button variant="secondary" onClick={() => handleEdit(booking)}>
                                        Редактировать
                                    </Button>
                                </Col>
                            </Row>
                            {editingBookingId === booking.id && (
                                <Form className="mt-3">
                                    {booking.bookingType === 'appointment' && (
                                        <Form.Group controlId={`editTime-${booking.id}`} className="mb-2">
                                            <Form.Label>Новое время записи</Form.Label>
                                            <Form.Control
                                                type="datetime-local"
                                                value={newBookingTime}
                                                onChange={(e) => setNewBookingTime(e.target.value)}
                                            />
                                        </Form.Group>
                                    )}
                                    <Form.Group controlId={`editStatus-${booking.id}`} className="mb-2">
                                        <Form.Label>Статус бронирования</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                        >
                                            <option value="pending">pending</option>
                                            <option value="confirmed">confirmed</option>
                                            <option value="cancelled">cancelled</option>
                                        </Form.Control>
                                    </Form.Group>
                                    <Button variant="primary" onClick={() => handleUpdate(booking.id)}>
                                        Сохранить изменения
                                    </Button>
                                </Form>
                            )}
                        </Card.Body>
                    </Card>
                ))
            )}
        </Container>
    );
};

export default AdminBookings;
