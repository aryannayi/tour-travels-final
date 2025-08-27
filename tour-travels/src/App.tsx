import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ToursPage from './pages/ToursPage';
import TourDetailsPage from './pages/TourDetailsPage';
import BookingPage from './pages/BookingPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/user/DashboardPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTours from './pages/admin/AdminTours';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/tours/:id" element={<TourDetailsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected User Routes */}
          <Route path="/booking/:id" element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/tours" element={
            <AdminRoute>
              <AdminTours />
            </AdminRoute>
          } />
          <Route path="/admin/bookings" element={
            <AdminRoute>
              <AdminBookings />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;