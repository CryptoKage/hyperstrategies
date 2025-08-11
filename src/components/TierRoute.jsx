// src/components/TierRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Restricts access to users who have at least the specified account tier.
 * Redirects to the dashboard if the requirement is not met.
 */
const TierRoute = ({ minTier = 2, children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userTier = user.account_tier || 1;
  if (userTier < minTier) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default TierRoute;
