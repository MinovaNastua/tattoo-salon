import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Alert, Image } from 'react-bootstrap';
import instance from '../../redux/axios';
import { useParams } from 'react-router-dom';

// Подкомпонент для карточки портфолио
const PortfolioCard = ({ photo }) => (
    <Col>
        <Card className="portfolio-card">
            {photo.image ? (
                <Card.Img
                    variant="top"
                    src={`http://localhost:5000${photo.image}`}
                    className="portfolio-card-img"
                />
            ) : (
                <Card.Img
                    variant="top"
                    src="https://via.placeholder.com/300x200?text=Нет+фото"
                    className="portfolio-card-img"
                />
            )}
            <Card.Body>
                <Card.Title>{photo.title}</Card.Title>
                <Card.Text>{photo.description}</Card.Text>
                <Card.Text>
                    <strong>Теги:</strong> {photo.tags}
                </Card.Text>
            </Card.Body>
        </Card>
    </Col>
);

const MasterDetail = () => {
    const { id } = useParams(); // Получаем id мастера из URL
    const [master, setMaster] = useState(null);
    const [portfolioPhotos, setPortfolioPhotos] = useState([]);
    const [error, setError] = useState('');
    const [searchTag, setSearchTag] = useState('');
    const [searchTitle, setSearchTitle] = useState('');

    useEffect(() => {
        fetchMasterDetail();
        fetchPortfolio();
    }, [id]);

    const fetchMasterDetail = async () => {
        try {
            const response = await instance.get(`/masters/${id}`);
            setMaster(response.data);
        } catch (err) {
            setError('Ошибка при загрузке данных мастера');
        }
    };

    const fetchPortfolio = async () => {
        try {
            const response = await instance.get('/portfolioPhotos');
            // Фильтруем записи по masterId
            const photos = response.data.filter(
                (photo) => photo.masterId === Number(id)
            );
            setPortfolioPhotos(photos);
        } catch (err) {
            setError('Ошибка при загрузке портфолио мастера');
        }
    };

    // Фильтрация портфолио по тегам и заголовку
    const filteredPhotos = portfolioPhotos.filter((photo) => {
        const matchesTag = searchTag.trim()
            ? photo.tags &&
              photo.tags.toLowerCase().includes(searchTag.toLowerCase())
            : true;
        const matchesTitle = searchTitle.trim()
            ? photo.title &&
              photo.title.toLowerCase().includes(searchTitle.toLowerCase())
            : true;
        return matchesTag && matchesTitle;
    });

    return (
        <Container className="mt-4 master-detail-page">
            {error && <Alert variant="danger">{error}</Alert>}
            {master ? (
                <>
                    <Row className="mb-4 master-info">
                        <Col md={4} className="master-photo-col">
                            {master.photo ? (
                                <Image
                                    src={`http://localhost:5000${master.photo}`}
                                    alt="Фото мастера"
                                    rounded
                                    fluid
                                    className="master-photo"
                                />
                            ) : (
                                <Alert variant="info">Нет фото мастера</Alert>
                            )}
                        </Col>
                        <Col md={8} className="master-details">
                            <h2 className="master-name">
                                {master.firstName} {master.lastName}
                            </h2>
                            <p>
                                <strong>Email:</strong> {master.email}
                            </p>
                            <p>
                                <strong>Телефон:</strong> {master.phone}
                            </p>
                            <p>
                                <strong>Биография:</strong> {master.biography}
                            </p>
                            <p>
                                <strong>Опыт:</strong> {master.experience} лет
                            </p>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col xs={12} md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Поиск по тегам"
                                value={searchTag}
                                onChange={(e) => setSearchTag(e.target.value)}
                                className="search-input"
                            />
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Поиск по заголовку"
                                value={searchTitle}
                                onChange={(e) => setSearchTitle(e.target.value)}
                                className="search-input"
                            />
                        </Col>
                    </Row>
                    <Row xs={1} sm={2} md={3} lg={4} className="g-4 portfolio-grid">
                        {filteredPhotos.length > 0 ? (
                            filteredPhotos.map((photo) => (
                                <PortfolioCard key={photo.id} photo={photo} />
                            ))
                        ) : (
                            <Col>
                                <Alert variant="info">Нет записей в портфолио</Alert>
                            </Col>
                        )}
                    </Row>
                </>
            ) : (
                <Alert variant="info">Загрузка данных мастера...</Alert>
            )}
        </Container>
    );
};

export default MasterDetail;
