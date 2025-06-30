// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  console.log('[ProtectedRoute.jsx] 🛡️ Guard is running. User object is:', user);

  if (!user) {
    console.log('[ProtectedRoute.jsx] 🛡️ ❌ User not found. REDIRECTING to /login.');
    return <Navigate to="/login" replace />;
  }

  console.log('[ProtectedRoute.jsx] 🛡️ ✅ User found. ALLOWING access.');
  return children;
};

export default ProtectedRoute;