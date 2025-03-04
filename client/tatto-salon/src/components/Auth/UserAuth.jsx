import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, login, selectCurrentUser, selectUserStatus, selectUserError } from '../../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../style/headerStyle.module.css';

const UserAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const status = useSelector(selectUserStatus);
    const error = useSelector(selectUserError);
    const currentUser = useSelector(selectCurrentUser);

    const { setAuth } = useAuth();

    const [isRegister, setIsRegister] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
    });

    useEffect(() => {
        if (currentUser) {
            setAuth(currentUser, 'client');
            navigate('/home');
        }
    }, [currentUser, navigate, setAuth]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegister) {
                await dispatch(register(formData)).unwrap();
                setSuccessMessage('Регистрация прошла успешно! Теперь вы можете войти в систему.');
                setIsRegister(false);
                setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '' });
            } else {
                const data = await dispatch(login({ email: formData.email, password: formData.password })).unwrap();
                // Ожидается формат: { token, user, role: 'client' }
                setAuth(data.user, data.role);
            }
        } catch (err) {
            console.error('Ошибка при входе/регистрации клиента:', err);
        }
    };

    return (
        <div className={styles.cardbody1}>
            <div className={styles.cardbody2} style={{ maxWidth: '500px' }}>
                <div className={styles.cardbody}>
                    <h3 className="card-title text-center mb-4">
                        {isRegister ? 'Регистрация Клиента' : 'Авторизация Клиента'}
                    </h3>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                    <form onSubmit={handleSubmit}>
                        {isRegister && (
                            <>
                                <div className="mb-3">
                                    <label htmlFor="firstName" className="form-label">
                                        Имя
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="lastName" className="form-label">
                                        Фамилия
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="phone" className="form-label">
                                        Телефон
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">
                                Пароль
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className={styles.button} disabled={status === 'loading'}>
                            {status === 'loading'
                                ? 'Загрузка...'
                                : isRegister
                                    ? 'Зарегистрироваться'
                                    : 'Войти'}
                        </button>
                    </form>
                    <div className="mt-3 text-center">
                        <button className={styles.text} onClick={() => {
                            setIsRegister(prev => !prev);
                            setSuccessMessage('');
                        }}>
                            {isRegister ? 'Уже есть аккаунт? Авторизоваться' : 'Нет аккаунта? Зарегистрироваться'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAuth;
