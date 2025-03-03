import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Image } from 'react-bootstrap';
import instance from '../../redux/axios';

const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        photoFile: null,
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Загрузка профиля пользователя
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // Эндпоинт /users/auth возвращает { client, role: 'client' }
            const response = await instance.get('/users/auth');
            // Используем данные из response.data.client
            setProfile(response.data.client);
            setFormData({
                firstName: response.data.client.firstName || '',
                lastName: response.data.client.lastName || '',
                email: response.data.client.email || '',
                password: '',
                phone: response.data.client.phone || '',
                photoFile: null,
            });
        } catch (err) {
            setError('Ошибка при загрузке профиля');
        }
    };

    const handleChange = (e) => {
        const { name, type, value, files } = e.target;
        if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (!profile) return;

        const data = new FormData();
        data.append('firstName', formData.firstName);
        data.append('lastName', formData.lastName);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        if (formData.password) {
            data.append('password', formData.password);
        }
        if (formData.photoFile) {
            data.append('photo', formData.photoFile);
        }

        try {
            await instance.put(`/users/${profile.id}`, data);
            setMessage('Профиль успешно обновлён');
            fetchProfile();
        } catch (err) {
            setError('Ошибка при обновлении профиля');
        }
    };

    return (
        <Container className="mt-4">
            <h1>Управление профилем</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            {profile && (
                <>
                    <Row className="mb-3">
                        <Col xs={12} md={4}>
                            {profile.photo ? (
                                <Image
                                    src={`http://localhost:5000${profile.photo}`}
                                    alt="Аватар пользователя"
                                    rounded
                                    fluid
                                />
                            ) : (
                                <Alert variant="info">Нет аватара</Alert>
                            )}
                        </Col>
                    </Row>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formFirstName">
                            <Form.Label>Имя</Form.Label>
                            <Form.Control
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formLastName">
                            <Form.Label>Фамилия</Form.Label>
                            <Form.Control
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formPhone">
                            <Form.Label>Телефон</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label>Пароль (новый, если хотите изменить)</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formPhoto">
                            <Form.Label>Аватар (новое изображение)</Form.Label>
                            <Form.Control
                                type="file"
                                name="photoFile"
                                onChange={handleChange}
                                accept="image/*"
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Обновить профиль
                        </Button>
                    </Form>
                </>
            )}
        </Container>
    );
};

export default UserProfile;
