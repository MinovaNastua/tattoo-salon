import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../redux/axios'; // настроенный экземпляр axios
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Функция для синхронизации состояния авторизации из Redux
    const setAuth = (userData, roleData) => {
        setUser(userData);
        setRole(roleData);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedRole = localStorage.getItem('role');
        console.log('AuthProvider mounted, token:', token, 'savedRole:', savedRole);
        if (token && savedRole) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const fetchProfile = async () => {
                try {
                    let profileData;
                    if (savedRole === 'admin') {
                        profileData = await axios.get('/admins/auth');
                        console.log('Response from /admins/auth:', profileData.data);
                        setRole(profileData.data.role || 'admin');
                        setUser(profileData.data.admin);
                    } else if (savedRole === 'master') {
                        profileData = await axios.get('/masters/auth');
                        console.log('Response from /masters/auth:', profileData.data);
                        setRole(profileData.data.role || 'master');
                        setUser(profileData.data.master);
                    } else if (savedRole === 'client') {
                        profileData = await axios.get('/users/auth');
                        console.log('Response from /users/auth:', profileData.data);
                        setRole(profileData.data.role || 'client');
                        setUser(profileData.data.client);
                    } else {
                        console.error('Неизвестная роль в localStorage:', savedRole);
                    }
                } catch (error) {
                    console.error('Ошибка при попытке получить профиль', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    delete axios.defaults.headers.common['Authorization'];
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const loginUser = async (email, password) => {
        try {
            const { data } = await axios.post('/users/login', { email, password });
            // Ожидается формат: { token, user, role: 'client' }
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            setUser(data.user);
            setRole(data.role);
            navigate('/home');
        } catch (err) {
            console.error('Ошибка при логине', err);
            throw err;
        }
    };

    const logoutUser = () => {
        setUser(null);
        setRole(null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, loginUser, logoutUser, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
