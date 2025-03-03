import React, { useState, useEffect } from 'react';
import instance from '../../redux/axios'; // Импорт настроенного экземпляра axios
import { Container, Row, Col, Form, Button, Table, Alert, Image } from 'react-bootstrap';

const SketchManager = () => {
    // Состояния для списка эскизов, данных формы, режима редактирования и сообщений об успехе/ошибке
    const [sketches, setSketches] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        imageFile: null, // файл изображения
        isReserved: false,
    });
    const [editing, setEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Загрузка списка эскизов при монтировании компонента
    useEffect(() => {
        fetchSketches();
    }, []);

    const fetchSketches = async () => {
        try {
            const response = await instance.get('/sketches');
            setSketches(response.data);
        } catch (err) {
            setError('Ошибка при получении списка эскизов');
        }
    };

    // Обработчик изменения полей формы (учитывает file input и checkbox)
    const handleChange = (e) => {
        const { name, type, value, checked, files } = e.target;
        if (type === 'file') {
            setFormData({ ...formData, imageFile: files[0] });
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Обработчик отправки формы для создания или обновления эскиза
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Создаем FormData для отправки файлов
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('tags', formData.tags);
        if (editing) {
            data.append('isReserved', formData.isReserved);
        }
        // Используем ключ "image", чтобы соответствовать upload.single('image')
        if (formData.imageFile) {
            data.append('image', formData.imageFile);
        } else if (!editing) {
            setError('Изображение эскиза обязательно');
            return;
        }

        try {
            if (editing) {
                await instance.put(`/sketches/${editingId}`, data);
                setMessage('Эскиз обновлён успешно');
            } else {
                await instance.post('/sketches', data);
                setMessage('Эскиз создан успешно');
            }
            // Сброс формы и обновление списка
            setFormData({
                title: '',
                description: '',
                tags: '',
                imageFile: null,
                isReserved: false,
            });
            setEditing(false);
            setEditingId(null);
            fetchSketches();
        } catch (err) {
            setError('Ошибка при сохранении эскиза');
        }
    };

    // Заполнение формы для редактирования выбранного эскиза
    const handleEdit = (sketch) => {
        setEditing(true);
        setEditingId(sketch.id);
        setFormData({
            title: sketch.title,
            description: sketch.description,
            tags: sketch.tags,
            imageFile: null, // файл не подставляем, пользователь должен выбрать новый, если необходимо
            isReserved: sketch.isReserved,
        });
        setMessage('');
        setError('');
    };

    // Удаление эскиза
    const handleDelete = async (id) => {
        setMessage('');
        setError('');
        try {
            await instance.delete(`/sketches/${id}`);
            setMessage('Эскиз удалён успешно');
            fetchSketches();
        } catch (err) {
            setError('Ошибка при удалении эскиза');
        }
    };

    return (
        <Container className="mt-4">
            {/* Список эскизов */}
            <Row className="mb-4">
                <Col>
                    <h2>Список эскизов</h2>
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Заголовок</th>
                                <th>Описание</th>
                                <th>Теги</th>
                                <th>Изображение</th>
                                <th>Зарезервирован</th>
                                <th>Клиент резервирования</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sketches.map((sketch) => (
                                <tr key={sketch.id}>
                                    <td>{sketch.id}</td>
                                    <td>{sketch.title}</td>
                                    <td>{sketch.description}</td>
                                    <td>{sketch.tags}</td>
                                    <td>
                                        {sketch.image && (
                                            <Image
                                                src={`http://localhost:5000${sketch.image}`}
                                                thumbnail
                                                style={{ width: '300px' }}
                                            />
                                        )}
                                    </td>
                                    <td>{sketch.isReserved ? 'Да' : 'Нет'}</td>
                                    <td>
                                        {sketch.Booking && sketch.Booking.Client
                                            ? `${sketch.Booking.Client.firstName} ${sketch.Booking.Client.lastName}`
                                            : '-'}
                                    </td>
                                    <td>
                                        <Button variant="primary" size="sm" onClick={() => handleEdit(sketch)}>
                                            Редактировать
                                        </Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(sketch.id)}>
                                            Удалить
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {sketches.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        Нет эскизов
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            {/* Форма создания/редактирования эскиза */}
            <Row>
                <Col md={6}>
                    <h2>{editing ? 'Редактирование эскиза' : 'Создание нового эскиза'}</h2>
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
                        <Form.Group controlId="formDescription">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                placeholder="Введите описание"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formTags">
                            <Form.Label>Теги (через запятую)</Form.Label>
                            <Form.Control
                                type="text"
                                name="tags"
                                placeholder="Введите теги"
                                value={formData.tags}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formImage">
                            <Form.Label>Изображение эскиза</Form.Label>
                            <Form.Control
                                type="file"
                                name="imageFile"
                                onChange={handleChange}
                                accept="image/*"
                                required={!editing} // для создания изображение обязательно
                            />
                        </Form.Group>
                        {/* Поле для обновления статуса резервации отображается только при редактировании */}
                        {editing && (
                            <Form.Group controlId="formIsReserved">
                                <Form.Check
                                    type="checkbox"
                                    label="Зарезервирован"
                                    name="isReserved"
                                    checked={formData.isReserved}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        )}
                        <Button variant="success" type="submit">
                            {editing ? 'Обновить эскиз' : 'Создать эскиз'}
                        </Button>{' '}
                        {editing && (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setEditing(false);
                                    setEditingId(null);
                                    setFormData({
                                        title: '',
                                        description: '',
                                        tags: '',
                                        imageFile: null,
                                        isReserved: false,
                                    });
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

export default SketchManager;