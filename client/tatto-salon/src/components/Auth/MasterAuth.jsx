import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../style/headerStyle.module.css';
import {
    registerMaster,
    loginMaster,
    selectCurrentMaster,
    selectMasterStatus,
    selectMasterError
} from '../../redux/slices/masterSlice';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MasterAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const status = useSelector(selectMasterStatus);
    const error = useSelector(selectMasterError);
    const currentMaster = useSelector(selectCurrentMaster);

    const { setAuth } = useAuth();

    const [isRegister, setIsRegister] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        biography: '',
        experience: '',
        // photo: null,
    });

    useEffect(() => {
        if (currentMaster) {
            setAuth(currentMaster, 'master');
            navigate('/master-dashboard');
        }
    }, [currentMaster, navigate, setAuth]);

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
                await dispatch(registerMaster(formData)).unwrap();
                // Уведомляем пользователя об успешной регистрации
                setSuccessMessage('Регистрация прошла успешно! Теперь вы можете войти в аккаунт.');
                // Переключаем режим на авторизацию
                setIsRegister(false);
                // Опционально сбрасываем поля формы
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    phone: '',
                    biography: '',
                    experience: '',
                });
            } else {
                const data = await dispatch(loginMaster({ email: formData.email, password: formData.password })).unwrap();
                // Ожидается: { token, master, role: 'master' }
                setAuth(data.master, data.role);
            }
        } catch (err) {
            console.error('Ошибка при входе/регистрации мастера:', err);
        }
    };

    return (
        <div className={styles.cardbody1}>
            <div className={styles.cardbody2} style={{ maxWidth: '600px' }}>
                <div className={styles.cardbody}>
                    <h3 className="card-title text-center mb-4">
                        {isRegister ? 'Регистрация Мастера' : 'Авторизация Мастера'}
                    </h3>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                    <form onSubmit={handleSubmit}>
                        {isRegister && (
                            <>
                                <div className="mb-3 row">
                                    <div className="col">
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
                                    <div className="col">
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
                        {isRegister && (
                            <>
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
                                <div className="mb-3">
                                    <label htmlFor="biography" className="form-label">
                                        Биография
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="biography"
                                        name="biography"
                                        value={formData.biography}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="experience" className="form-label">
                                        Опыт (в годах)
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="experience"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
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
                        <button
                            className={styles.text}
                            onClick={() => {
                                setIsRegister(prev => !prev);
                                setSuccessMessage('');
                            }}
                        >
                            {isRegister ? 'Уже есть аккаунт? Авторизоваться' : 'Нет аккаунта? Зарегистрироваться'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MasterAuth;
