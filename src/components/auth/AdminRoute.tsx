import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, userProfile, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;