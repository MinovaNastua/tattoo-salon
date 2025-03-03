import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import AdminAuth from './components/Auth/AdminAuth';
import MasterAuth from './components/Auth/MasterAuth';
import UserAuth from './components/Auth/UserAuth';
import BlogPostManager from './components/admin-menu/BlogPostManager';
import SketchManager from './components/admin-menu/SketchManager';
import MasterManager from './components/admin-menu/MasterManager';
import HomePage from './components/Client/HomePage';
import MasterDashboard from './components/Master/MasterDashboard';
import MasterDetail from './components/Client/MasterDetail';
import BlogPosts from './components/Client/BlogPosts';
import MyBookings from './components/Client/MyBookings';
import AdminBookings from './components/admin-menu/BookingsManager';
import MasterCalendarBookings from './components/Master/MasterBookings';
import AdminReviews from './components/admin-menu/ReviewsManager';
import UserProfile from './components/Client/UserProfile';
import Header from './components/Header';
import { AuthProvider } from './context/AuthContext';

const Home = () => <h2>Похоже тут ничего нет</h2>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Header />
          <div className="container mt-4">
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/admin-auth" element={<AdminAuth />} />
              <Route path="/master-auth" element={<MasterAuth />} />
              <Route path="/user-auth" element={<UserAuth />} />
              <Route path="/blog" element={<BlogPosts />} />

              {/* Маршруты для админа */}
              <Route
                path="/blog-manager"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <BlogPostManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sketch-manager"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <SketchManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="/booking-manager"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminBookings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reviews-manager"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminReviews />
                  </PrivateRoute>
                }
              />
              <Route
                path="/master-manager"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <MasterManager />
                  </PrivateRoute>
                }
              />

              {/* Маршруты для мастера */}
              <Route
                path="/master-dashboard"
                element={
                  <PrivateRoute allowedRoles={['master']}>
                    <MasterDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/master-bookings"
                element={
                  <PrivateRoute allowedRoles={['master']}>
                    <MasterCalendarBookings />
                  </PrivateRoute>
                }
              />
              <Route path="/master-details/:id" element={<MasterDetail />} />

              {/* Маршруты для клиента */}
              <Route
                path="/home"
                element={
                  <PrivateRoute allowedRoles={['client']}>
                    <HomePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute allowedRoles={['client']}>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <PrivateRoute allowedRoles={['client']}>
                    <MyBookings />
                  </PrivateRoute>
                }
              />

              {/* Главная страница */}
              <Route
                path="/"
                element={
                  <PrivateRoute allowedRoles={['admin', 'master', 'client']}>
                    <Home />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;