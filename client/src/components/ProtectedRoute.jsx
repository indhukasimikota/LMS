import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

// Redirects unauthenticated users to /login
// Optionally restricts to a specific role: 'admin' | 'student'
const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role && user?.role !== role) {
    // Wrong role — redirect to their own dashboard
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
