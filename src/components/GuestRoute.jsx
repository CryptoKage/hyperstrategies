// src/components/GuestRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component will wrap pages like Login and Register.
const GuestRoute = ({ children }) => {
  const { user } = useAuth();

  // If a user object exists, it means they are already logged in.
  if (user) {
    // Redirect them away from the login/register page and to their dashboard.
    return <Navigate to="/dashboard" replace />;
  }

  // If there is no user, render the page they were trying to access (Login/Register).
  return children;
};

export default GuestRoute;