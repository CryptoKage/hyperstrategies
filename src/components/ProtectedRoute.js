import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component will wrap any route we want to protect.
// It takes one prop, 'children', which will be the page component
// (e.g., <Dashboard />) that we want to render if the user is authenticated.
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // If the user is not logged in...
  if (!isLoggedIn) {
    // ...redirect them to the /login page.
    // We pass the 'location' state so that after logging in, we could
    // potentially redirect them back to the page they were trying to access.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is logged in, render the child component (the protected page).
  return children;
};

export default ProtectedRoute;