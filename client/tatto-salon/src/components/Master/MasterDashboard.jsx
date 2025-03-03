import React, { useState, useEffect } from 'react';
import instance from '../../redux/axios';
import {
    Container,
    Tabs,
    Tab,
    Alert,
    Form,
    Button,
    Row,
    Col,
    Card,
    Image,
} from 'react-bootstrap';

const MasterDashboard = () => {
    // Состояния профиля
    const [master, setMaster] = useState(null);
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        biography: '',
        experience: '',
        photoFile: null,
    });
    const [profileMessage, setProfileMessage] = useState('');
    const [profileError, setProfileError] = useState('');

    // Состояния портфолио
    const [portfolioPhotos, setPortfolioPhotos] = useState([]);
    const [portfolioForm, setPortfolioForm] = useState({
        title: '',
        description: '',
        tags: '',
        imageFile: null,
    });
    const [editingPortfolio, setEditingPortfolio] = useState(false);
    const [editingPortfolioId, setEditingPortfolioId] = useState(null);
    const [portfolioMessage, setPortfolioMessage] = useState('');
    const [portfolioError, setPortfolioError] = useState('');

    // Состояния поиска портфолио
    const [portfolioSearchTag, setPortfolioSearchTag] = useState('');
    const [portfolioSearchTitle, setPortfolioSearchTitle] = useState('');

    const [activeKey, setActiveKey] = useState('profile');

    // Загрузка профиля мастера через эндпоинт auth
    const fetchMasterProfile = async () => {
        try {
            const response = await instance.get('/masters/auth');
            // Дополнительно можно вывести данные в консоль для отладки
            console.log('Ответ от /masters/auth:', response.data);
            setMaster(response.data.master); // изменено
            setProfileForm({
                firstName: response.data.master.firstName || '',
                lastName: response.data.master.lastName || '',
                email: response.data.master.email || '',
                password: '',
                phone: response.data.master.phone || '',
                biography: response.data.master.biography || '',
                experience: response.data.master.experience
                    ? response.data.master.experience.toString()
                    : '',
                photoFile: null,
            });
        } catch (err) {
            setProfileError('Ошибка при загрузке профиля');
        }
    };

    // Загрузка портфолио для мастера (фильтруем по masterId)
    const fetchPortfolioPhotos = async () => {
        try {
            const response = await instance.get('/portfolioPhotos');
            if (master && master.id) {
                const myPhotos = response.data.filter(
                    (photo) => photo.masterId === master.id
                );
                setPortfolioPhotos(myPhotos);
            }
        } catch (err) {
            setPortfolioError('Ошибка при загрузке портфолио');
        }
    };

    useEffect(() => {
        fetchMasterProfile();
    }, []);

    // После загрузки профиля загружаем портфолио
    useEffect(() => {
        if (master && master.id) {
            fetchPortfolioPhotos();
        }
    }, [master]);

    // Обработчик для профиля
    const handleProfileChange = (e) => {
        const { name, type, value, files } = e.target;
        if (type === 'file') {
            setProfileForm({ ...profileForm, [name]: files[0] });
        } else {
            setProfileForm({ ...profileForm, [name]: value });
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileMessage('');
        setProfileError('');
        if (!master) return;

        const data = new FormData();
        data.append('firstName', profileForm.firstName);
        data.append('lastName', profileForm.lastName);
        data.append('email', profileForm.email);
        data.append('phone', profileForm.phone);
        data.append('biography', profileForm.biography);
        data.append('experience', profileForm.experience);
        if (profileForm.password) {
            data.append('password', profileForm.password);
        }
        if (profileForm.photoFile) {
            // Контроллер ожидает поле "photo"
            data.append('photo', profileForm.photoFile);
        }

        try {
            await instance.put(`/masters/${master.id}`, data);
            setProfileMessage('Профиль успешно обновлён');
            fetchMasterProfile();
        } catch (err) {
            setProfileError('Ошибка при обновлении профиля');
        }
    };

    // Обработчики для портфолио
    const handlePortfolioChange = (e) => {
        const { name, type, value, files } = e.target;
        if (type === 'file') {
            setPortfolioForm({ ...portfolioForm, [name]: files[0] });
        } else {
            setPortfolioForm({ ...portfolioForm, [name]: value });
        }
    };

    const handlePortfolioSubmit = async (e) => {
        e.preventDefault();
        setPortfolioMessage('');
        setPortfolioError('');

        const data = new FormData();
        data.append('title', portfolioForm.title);
        data.append('description', portfolioForm.description);
        data.append('tags', portfolioForm.tags);
        if (portfolioForm.imageFile) {
            data.append('image', portfolioForm.imageFile);
        } else if (!editingPortfolio) {
            setPortfolioError('Изображение обязательно');
            return;
        }

        try {
            if (editingPortfolio) {
                await instance.put(`/portfolioPhotos/${editingPortfolioId}`, data);
                setPortfolioMessage('Запись портфолио успешно обновлена');
            } else {
                await instance.post('/portfolioPhotos', data);
                setPortfolioMessage('Запись портфолио успешно создана');
            }
            setPortfolioForm({
                title: '',
                description: '',
                tags: '',
                imageFile: null,
            });
            setEditingPortfolio(false);
            setEditingPortfolioId(null);
            fetchPortfolioPhotos();
        } catch (err) {
            setPortfolioError('Ошибка при сохранении записи портфолио');
        }
    };

    const handleEditPortfolio = (photo) => {
        setEditingPortfolio(true);
        setEditingPortfolioId(photo.id);
        setPortfolioForm({
            title: photo.title || '',
            description: photo.description || '',
            tags: photo.tags || '',
            imageFile: null,
        });
        setPortfolioMessage('');
        setPortfolioError('');
    };

    const handleDeletePortfolio = async (id) => {
        try {
            await instance.delete(`/portfolioPhotos/${id}`);
            setPortfolioMessage('Запись портфолио успешно удалена');
            fetchPortfolioPhotos();
        } catch (err) {
            setPortfolioError('Ошибка при удалении записи портфолио');
        }
    };

    // Фильтрация портфолио по тегам и заголовку
    const filteredPortfolioPhotos = portfolioPhotos.filter((photo) => {
        let tagMatch = true;
        let titleMatch = true;
        if (portfolioSearchTag.trim() !== '') {
            tagMatch =
                photo.tags &&
                photo.tags.toLowerCase().includes(portfolioSearchTag.toLowerCase());
        }
        if (portfolioSearchTitle.trim() !== '') {
            titleMatch =
                photo.title &&
                photo.title.toLowerCase().includes(portfolioSearchTitle.toLowerCase());
        }
        return tagMatch && titleMatch;
    });

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Панель мастера</h1>
            <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k)} className="mb-4">
                <Tab eventKey="profile" title="Мой профиль">
                    {profileError && <Alert variant="danger">{profileError}</Alert>}
                    {profileMessage && <Alert variant="success">{profileMessage}</Alert>}
                    {/* Отображение фото профиля */}
                    {master && master.photo ? (
                        <Row className="mb-3">
                            <Col xs={12} md={4}>
                                <Image
                                    src={`http://localhost:5000${master.photo}`}
                                    alt="Фото профиля"
                                    rounded
                                    fluid
                                />
                            </Col>
                        </Row>
                    ) : (
                        <Alert variant="info">Нет фото профиля</Alert>
                    )}
                    {master && (
                        <Form onSubmit={handleProfileSubmit}>
                            <Form.Group className="mb-3" controlId="profileFirstName">
                                <Form.Label>Имя</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    value={profileForm.firstName}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="profileLastName">
                                <Form.Label>Фамилия</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    value={profileForm.lastName}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="profileEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={profileForm.email}
                                    onChange={handleProfileChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="profilePassword">
                                <Form.Label>Пароль (если меняете)</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={profileForm.password}
                                    onChange={handleProfileChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="profilePhone">
                                <Form.Label>Телефон</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone"
                                    value={profileForm.phone}
                                    onChange={handleProfileChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="profileBiography">
                                <Form.Label>Биография</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="biography"
                                    value={profileForm.biography}
                                    onChange={handleProfileChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="profileExperience">
                                <Form.Label>Опыт (лет)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="experience"
                                    value={profileForm.experience}
                                    onChange={handleProfileChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="profilePhoto">
                                <Form.Label>Фото</Form.Label>
                                <Form.Control
                                    type="file"
                                    name="photoFile"
                                    onChange={handleProfileChange}
                                    accept="image/*"
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Обновить профиль
                            </Button>
                        </Form>
                    )}
                </Tab>
                <Tab eventKey="portfolio" title="Моё портфолио">
                    {portfolioError && <Alert variant="danger">{portfolioError}</Alert>}
                    {portfolioMessage && <Alert variant="success">{portfolioMessage}</Alert>}
                    {/* Форма поиска по тегам и заголовку */}
                    <Row className="mb-3">
                        <Col xs={12} md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Поиск по тегам"
                                value={portfolioSearchTag}
                                onChange={(e) => setPortfolioSearchTag(e.target.value)}
                            />
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Поиск по заголовку"
                                value={portfolioSearchTitle}
                                onChange={(e) => setPortfolioSearchTitle(e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col>
                            <h4>
                                {editingPortfolio
                                    ? 'Редактирование записи портфолио'
                                    : 'Добавить запись в портфолио'}
                            </h4>
                            <Form onSubmit={handlePortfolioSubmit}>
                                <Form.Group className="mb-3" controlId="portfolioTitle">
                                    <Form.Label>Заголовок</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={portfolioForm.title}
                                        onChange={handlePortfolioChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="portfolioDescription">
                                    <Form.Label>Описание</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="description"
                                        value={portfolioForm.description}
                                        onChange={handlePortfolioChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="portfolioTags">
                                    <Form.Label>Теги (через запятую)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="tags"
                                        value={portfolioForm.tags}
                                        onChange={handlePortfolioChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="portfolioImage">
                                    <Form.Label>Изображение</Form.Label>
                                    <Form.Control
                                        type="file"
                                        name="imageFile"
                                        onChange={handlePortfolioChange}
                                        accept="image/*"
                                        required={!editingPortfolio}
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    {editingPortfolio ? 'Обновить запись' : 'Добавить запись'}
                                </Button>{' '}
                                {editingPortfolio && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setEditingPortfolio(false);
                                            setEditingPortfolioId(null);
                                            setPortfolioForm({
                                                title: '',
                                                description: '',
                                                tags: '',
                                                imageFile: null,
                                            });
                                            setPortfolioMessage('');
                                            setPortfolioError('');
                                        }}
                                    >
                                        Отмена
                                    </Button>
                                )}
                            </Form>
                        </Col>
                    </Row>
                    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                        {filteredPortfolioPhotos.length > 0 ? (
                            filteredPortfolioPhotos.map((photo) => (
                                <Col key={photo.id}>
                                    <Card>
                                        {photo.image ? (
                                            <Card.Img
                                                variant="top"
                                                src={`http://localhost:5000${photo.image}`}
                                                style={{ height: '200px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <Card.Img
                                                variant="top"
                                                src="https://via.placeholder.com/300x200?text=Нет+фото"
                                                style={{ height: '200px', objectFit: 'cover' }}
                                            />
                                        )}
                                        <Card.Body>
                                            <Card.Title>{photo.title}</Card.Title>
                                            <Card.Text>{photo.description}</Card.Text>
                                            <Card.Text>
                                                <strong>Теги:</strong> {photo.tags}
                                            </Card.Text>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleEditPortfolio(photo)}
                                            >
                                                Редактировать
                                            </Button>{' '}
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDeletePortfolio(photo.id)}
                                            >
                                                Удалить
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col>
                                <Alert variant="info">Нет записей в портфолио</Alert>
                            </Col>
                        )}
                    </Row>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default MasterDashboard;
