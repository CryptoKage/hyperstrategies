// src/components/AdminRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // First, wait for the authentication check to complete
  if (loading) {
    return null; // Or a loading spinner
  }

  // If loading is done, check if the user exists AND if they are an admin
  if (user && user.isAdmin) {
    // If they are an admin, render the requested admin page
    return children;
  }

  // If they are not an admin (or not logged in), redirect them to the main dashboard
  // This prevents non-admins from even knowing the admin pages exist.
  return <Navigate to="/dashboard" replace />;
};

export default AdminRoute;