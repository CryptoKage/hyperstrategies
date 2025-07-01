// src/components/GuestRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // ✅ prevent redirect until we know auth state

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default GuestRoute;
