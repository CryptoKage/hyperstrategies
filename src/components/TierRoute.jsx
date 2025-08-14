// src/components/TierRoute.jsx
// This version adds a crucial check to handle the state update timing.

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode here

const TierRoute = ({ minTier = 2, children }) => {
  const { user, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    // This effect ensures we have the absolute latest user info from the token.
    // It protects against "stale state" issues from the context.
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded.user);
      } catch (e) {
        console.error("Invalid token in TierRoute:", e);
        setCurrentUser(null);
      }
    } else {
        setCurrentUser(null);
    }
  }, [user]); // Re-run this check if the user object in the context changes.

  if (authLoading) {
    // If the main AuthContext is still loading, wait.
    return null; 
  }

  if (!currentUser) {
    // If we have no user after checking the token, redirect to login.
    return <Navigate to="/login" replace />;
  }

  // Use the fresh 'currentUser' state for the check.
  const userTier = currentUser.account_tier || 1;
  if (userTier < minTier) {
    return <Navigate to="/dashboard" replace />;
  }

  // If all checks pass, render the child component (the marketplace page).
  return children;
};

export default TierRoute;
