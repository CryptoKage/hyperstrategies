// src/components/ProtectedRoute.jsx - SIMPLIFIED

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner'; // Optional: show a spinner

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, redirect to the login page.
  // This redirect is safe because it happens within the app domain
  // after the useDomainRedirects hook has already done its job.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
