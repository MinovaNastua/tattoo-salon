import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles, children }) => {
    const { user, role, loading } = useAuth();

    // Пока грузим профиль — показываем спиннер/заглушку
    if (loading) {
        return <div>Загрузка...</div>;
    }

    // Нет пользователя — редирект
    if (!user) {
        return <Navigate to="/user-auth" />;
    }

    // Если роль не совпадает — тоже редирект (или куда-то ещё)
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;
