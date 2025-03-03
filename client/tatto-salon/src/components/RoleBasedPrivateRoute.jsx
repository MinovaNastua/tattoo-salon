import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../redux/slices/userSlice';
import { selectCurrentAdmin } from '../redux/slices/adminSlice';
import { selectCurrentMaster } from '../redux/slices/masterSlice';
import { Navigate } from 'react-router-dom';

const RoleBasedPrivateRoute = ({ children, allowedRoles }) => {
    const currentUser = useSelector(selectCurrentUser);
    const currentAdmin = useSelector(selectCurrentAdmin);
    const currentMaster = useSelector(selectCurrentMaster);

    // Определяем роль пользователя на основе залогиненных данных
    let role = null;
    if (currentAdmin) {
        role = 'admin';
    } else if (currentMaster) {
        role = 'master';
    } else if (currentUser) {
        role = 'client';
    }

    // Если пользователь не залогинен, перенаправляем на страницу авторизации (можно выбрать любую)
    if (!role) {
        return <Navigate to="/user-auth" />;
    }

    // Если задан список разрешённых ролей и роль пользователя не входит в него,
    // можно перенаправить на домашнюю страницу или страницу с ошибкой доступа
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" />;
    }

    return children;
};

export default RoleBasedPrivateRoute;