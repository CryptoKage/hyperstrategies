// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // While we are checking the user's session, we don't know if they have access.
  // Show a loading spinner to prevent a "flash" of the protected page before we know their status.
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If loading is finished and the user is NOT authenticated, they cannot access this page.
  // We redirect them to the login page.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If loading is finished and the user IS authenticated, they have access. Show the page.
  return children;
};

export default ProtectedRoute;
