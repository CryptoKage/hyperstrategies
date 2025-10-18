// src/components/GuestRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // While we are checking the user's session, we don't know if they are a guest or not.
  // Showing a loading spinner prevents a "flash" of the login page if they are already logged in.
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If loading is finished and the user IS authenticated, they should not be on a guest page.
  // We redirect them to the dashboard. The AuthContext will handle the cross-domain jump if needed.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If loading is finished and they are NOT authenticated, they are a guest. Show the page.
  return children;
};

export default GuestRoute;
