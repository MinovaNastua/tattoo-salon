import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, role, logoutUser } = useAuth();
    const navigate = useNavigate();

    // Определяем имя пользователя для приветствия.
    // Для админа используем поле username, для остальных — firstName.
    let userName = '';
    if (role === 'admin' && user) {
        userName = user.username;
    } else if ((role === 'master' || role === 'client') && user) {
        userName = user.firstName;
    }

    const handleLogout = () => {
        logoutUser();
        navigate('/user-auth');
        // Обновляем страницу, чтобы сбросить состояние
        window.location.reload();
    };

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="https://i1.sndcdn.com/artworks-000493820265-j9bd8w-t500x500.jpg">
                    Sad boy vibe
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {role === 'admin' && (
                            <>
                                <Nav.Link as={Link} to="/blog-manager">Blog Manager</Nav.Link>
                                <Nav.Link as={Link} to="/sketch-manager">Sketch Manager</Nav.Link>
                                <Nav.Link as={Link} to="/booking-manager">Bookings Manager</Nav.Link>
                                <Nav.Link as={Link} to="/reviews-manager">Reviews Manager</Nav.Link>
                                <Nav.Link as={Link} to="/master-manager">Master Manager</Nav.Link>
                            </>
                        )}
                        {role === 'master' && (
                            <>
                                <Nav.Link as={Link} to="/master-dashboard">Доска</Nav.Link>
                                <Nav.Link as={Link} to="/master-bookings">Бронирования</Nav.Link>
                            </>
                        )}
                        {role === 'client' && (
                            <>
                                <Nav.Link as={Link} to="/home">Главная</Nav.Link>
                                <Nav.Link as={Link} to="/profile">Профиль</Nav.Link>
                                <Nav.Link as={Link} to="/bookings">Бронирования</Nav.Link>
                                <Nav.Link as={Link} to="/blog">Блог</Nav.Link>
                            </>
                        )}
                    </Nav>
                    <Nav>
                        {role && user ? (
                            <>
                                <Button variant="outline-danger" onClick={handleLogout} className="ms-2">
                                    Выйти
                                </Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/admin-auth">Админка</Nav.Link>
                                <Nav.Link as={Link} to="/master-auth">Мастер</Nav.Link>
                                <Nav.Link as={Link} to="/user-auth">Войти</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
