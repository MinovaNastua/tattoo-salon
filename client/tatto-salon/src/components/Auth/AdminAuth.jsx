import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerAdmin, loginAdmin, selectCurrentAdmin, selectAdminStatus, selectAdminError } from '../../redux/slices/adminSlice';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../style/headerStyle.module.css';

const AdminAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const status = useSelector(selectAdminStatus);
    const error = useSelector(selectAdminError);
    const currentAdmin = useSelector(selectCurrentAdmin);
    const { setAuth } = useAuth();

    const [isRegister, setIsRegister] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        // photo: null, // если требуется загрузка фото
    });

    useEffect(() => {
        if (currentAdmin) {
            // Если в Redux появился админ, синхронизируем AuthContext
            setAuth(currentAdmin, 'admin');
            navigate('/home');
        }
    }, [currentAdmin, navigate, setAuth]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegister) {
                await dispatch(registerAdmin(formData)).unwrap();
                // Уведомляем пользователя об успешной регистрации
                setSuccessMessage('Регистрация прошла успешно! Теперь вы можете войти в аккаунт.');
                // Переключаем режим на авторизацию
                setIsRegister(false);
                // Опционально можно сбросить форму:
                setFormData({ username: '', email: '', password: '' });
            } else {
                const data = await dispatch(loginAdmin({ email: formData.email, password: formData.password })).unwrap();
                // Ожидается формат: { token, admin, role: 'admin' }
                setAuth(data.admin, data.role);
            }
        } catch (err) {
            console.error('Ошибка при входе/регистрации админа:', err);
        }
    };

    return (
        <div className={styles.cardbody1}>
            <div className={styles.cardbody2} style={{ maxWidth: '500px' }}>
                <div className={styles.cardbody}>
                    <h3 className="card-title text-center mb-4">
                        {isRegister ? 'Регистрация Администратора' : 'Авторизация Администратора'}
                    </h3>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                    <form onSubmit={handleSubmit}>
                        {isRegister && (
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label">
                                    Имя пользователя
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
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
                        {isRegister && (
                            <div className="mb-3">
                                <label htmlFor="photo" className="form-label">
                                    Фото
                                </label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="photo"
                                    name="photo"
                                    onChange={handleChange}
                                />
                            </div>
                        )}
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
                            // Сбрасываем сообщение об успехе при переключении
                            setSuccessMessage('');
                        }}>
                            {isRegister
                                ? 'Уже есть аккаунт? Авторизоваться'
                                : 'Нет аккаунта? Зарегистрироваться'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAuth;
