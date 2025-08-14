// src/components/TierRoute.jsx
// TEMPORARY DEBUGGING VERSION

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TierRoute = ({ minTier = 2, children }) => {
  const { user, loading } = useAuth();

  // --- THIS IS OUR DEBUGGING X-RAY ---
  // This will print the user object to your browser's console.
  console.log('[TierRoute] Checking access. User object:', user);

  if (loading) {
    console.log('[TierRoute] Auth is loading...');
    return null; // Wait while the auth state is being determined.
  }

  if (!user) {
    console.log('[TierRoute] No user found. Redirecting to login.');
    return <Navigate to="/login" replace />;
  }

  const userTier = user.account_tier || 1;
  console.log(`[TierRoute] User Tier: ${userTier}, Required Tier: ${minTier}`);

  if (userTier < minTier) {
    console.log('[TierRoute] Access DENIED. Redirecting to dashboard.');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('[TierRoute] Access GRANTED.');
  return children;
};

export default TierRoute;
