import React, { useState, useEffect } from 'react';
import instance from '../../redux/axios'; // Импорт настроенного экземпляра axios
import { Container, Row, Col, Form, Button, Table, Alert, Image } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
    Document,
    Packer,
    Paragraph,
    Table as DocxTable,
    TableCell,
    TableRow,
    TextRun
} from 'docx';

const MasterManager = () => {
    const [masters, setMasters] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        biography: '',
        experience: '',
        photoFile: null,
    });
    const [editing, setEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Загрузка списка мастеров
    useEffect(() => {
        fetchMasters();
    }, []);

    const fetchMasters = async () => {
        try {
            const response = await instance.get('/masters');
            setMasters(response.data);
        } catch (err) {
            setError('Ошибка при получении списка мастеров');
        }
    };

    // Обработчик изменений в форме
    const handleChange = (e) => {
        const { name, type, value, files } = e.target;
        if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Отправка формы для обновления мастера
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        const data = new FormData();
        data.append('firstName', formData.firstName);
        data.append('lastName', formData.lastName);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('biography', formData.biography);
        data.append('experience', formData.experience);
        if (formData.password) {
            data.append('password', formData.password);
        }
        // Используем ключ "photo", чтобы контроллер обновил поле image (не забудьте обновить контроллер!)
        if (formData.photoFile) {
            data.append('photo', formData.photoFile);
        }

        try {
            await instance.put(`/masters/${editingId}`, data);
            setMessage('Мастер успешно обновлён');
            setEditing(false);
            setEditingId(null);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                phone: '',
                biography: '',
                experience: '',
                photoFile: null,
            });
            fetchMasters();
        } catch (err) {
            setError('Ошибка при обновлении мастера');
        }
    };

    // Заполнение формы для редактирования выбранного мастера
    const handleEdit = (master) => {
        setEditing(true);
        setEditingId(master.id);
        setFormData({
            firstName: master.firstName || '',
            lastName: master.lastName || '',
            email: master.email || '',
            password: '',
            phone: master.phone || '',
            biography: master.biography || '',
            experience: master.experience ? master.experience.toString() : '',
            photoFile: null,
        });
        setMessage('');
        setError('');
    };

    // Удаление мастера
    const handleDelete = async (id) => {
        setMessage('');
        setError('');
        try {
            await instance.delete(`/masters/${id}`);
            setMessage('Мастер успешно удалён');
            fetchMasters();
        } catch (err) {
            setError('Ошибка при удалении мастера');
        }
    };

    // Экспорт списка мастеров в Excel
    const exportToExcel = () => {
        // Подготавливаем данные для экспорта
        const data = masters.map(master => ({
            ID: master.id,
            Имя: master.firstName,
            Фамилия: master.lastName,
            Email: master.email,
            Телефон: master.phone,
            Биография: master.biography,
            Опыт: master.experience
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Masters');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(dataBlob, 'masters_report.xlsx');
    };

    // Экспорт списка мастеров в DOCX
    const exportToDocx = async () => {
        // Формируем заголовки таблицы
        const tableHeaders = [
            'ID',
            'Имя',
            'Фамилия',
            'Email',
            'Телефон',
            'Биография',
            'Опыт'
        ];

        // Формируем строки таблицы
        const tableRows = masters.map(master =>
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(master.id?.toString())] }),
                    new TableCell({ children: [new Paragraph(master.firstName || '')] }),
                    new TableCell({ children: [new Paragraph(master.lastName || '')] }),
                    new TableCell({ children: [new Paragraph(master.email || '')] }),
                    new TableCell({ children: [new Paragraph(master.phone || '')] }),
                    new TableCell({ children: [new Paragraph(master.biography || '')] }),
                    new TableCell({ children: [new Paragraph(master.experience?.toString() || '')] }),
                ],
            })
        );

        // Заголовок таблицы
        const headerRow = new TableRow({
            children: tableHeaders.map(header =>
                new TableCell({ children: [new Paragraph({ text: header, bold: true })] })
            )
        });

        const table = new DocxTable({
            rows: [headerRow, ...tableRows],
        });

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({ text: 'Отчет по мастерам', heading: 'Heading1' }),
                        table,
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, 'masters_report.docx');
    };

    return (
        <Container className="mt-4">
            {/* Кнопки для экспорта отчетов */}
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
            {/* Таблица со списком мастеров */}
            <Row className="mb-4">
                <Col>
                    <h2>Список мастеров</h2>
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Имя</th>
                                <th>Фамилия</th>
                                <th>Email</th>
                                <th>Телефон</th>
                                <th>Биография</th>
                                <th>Опыт (лет)</th>
                                <th>Фото</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {masters.map((master) => (
                                <tr key={master.id}>
                                    <td>{master.id}</td>
                                    <td>{master.firstName}</td>
                                    <td>{master.lastName}</td>
                                    <td>{master.email}</td>
                                    <td>{master.phone}</td>
                                    <td>{master.biography}</td>
                                    <td>{master.experience}</td>
                                    <td>
                                        {master.photo ? (
                                            <Image
                                                src={`http://localhost:5000${master.photo}`}
                                                thumbnail
                                                style={{ width: '100px' }}
                                            />
                                        ) : (
                                            'Нет фото'
                                        )}
                                    </td>
                                    <td>
                                        <Button variant="primary" size="sm" onClick={() => handleEdit(master)}>
                                            Редактировать
                                        </Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(master.id)}>
                                            Удалить
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {masters.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="text-center">
                                        Нет мастеров
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            {/* Форма редактирования мастера */}
            {editing && (
                <Row>
                    <Col md={6}>
                        <h2>Редактирование мастера</h2>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="formFirstName">
                                <Form.Label>Имя</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    placeholder="Введите имя"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="formLastName">
                                <Form.Label>Фамилия</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    placeholder="Введите фамилию"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="formEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    placeholder="Введите email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="formPassword">
                                <Form.Label>Пароль</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    placeholder="Оставьте пустым, если не меняете пароль"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="formPhone">
                                <Form.Label>Телефон</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone"
                                    placeholder="Введите телефон"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="formBiography">
                                <Form.Label>Биография</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="biography"
                                    placeholder="Введите биографию"
                                    value={formData.biography}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="formExperience">
                                <Form.Label>Опыт (лет)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="experience"
                                    placeholder="Введите опыт работы"
                                    value={formData.experience}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="formPhoto">
                                <Form.Label>Фото (если есть)</Form.Label>
                                <Form.Control
                                    type="file"
                                    name="photoFile"
                                    onChange={handleChange}
                                    accept="image/*"
                                />
                            </Form.Group>
                            <Button variant="success" type="submit">
                                Обновить мастера
                            </Button>{' '}
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setEditing(false);
                                    setEditingId(null);
                                    setFormData({
                                        firstName: '',
                                        lastName: '',
                                        email: '',
                                        password: '',
                                        phone: '',
                                        biography: '',
                                        experience: '',
                                        photoFile: null,
                                    });
                                    setMessage('');
                                    setError('');
                                }}
                            >
                                Отмена
                            </Button>
                        </Form>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default MasterManager;