// src/components/GuestRoute.jsx - SIMPLIFIED

import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner'; // Optional: show a spinner

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show a blank page or a spinner while auth state is being determined.
    return <LoadingSpinner />; 
  }

  // If the user is authenticated, the useDomainRedirects hook will handle
  // redirecting them away from this page to the app domain.
  // We don't need to do anything here. If they are not authenticated,
  // we render the children (e.g., the Login page).
  if (isAuthenticated) {
    // This component will briefly render null before the hook redirects.
    return null;
  }

  return children;
};

export default GuestRoute;
