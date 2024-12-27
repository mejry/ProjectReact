import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingPage } from '../components/ui/loading';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    // Redirect to login and save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to unauthorized page or dashboard based on user role
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  // If we have a user and they have the required role (or no role is required), render the children
  return children;
};

export default ProtectedRoute;