// src/context/AuthContext.js - NEW COOKIE-BASED VERSION

import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start as true to check for existing session
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  // The login function is now much simpler. It no longer handles tokens.
  // Its job is to set the user state after a successful API login call.
  const login = (userData) => {
    setUser(userData);
  };

  // Logout now calls the backend to clear the cookie.
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout API call failed, clearing user state anyway.", error);
    } finally {
      setUser(null); // Always clear the user from frontend state
    }
  }, []);

  // This function will be called on initial app load to check if a valid cookie exists
  const checkAuthStatus = useCallback(async () => {
    try {
      // We call the refresh-token endpoint. If the cookie is valid, the backend
      // will respond with the user's data.
      const response = await api.post('/auth/refresh-token');
      setUser(response.data.user);
    } catch (error) {
      // If the cookie is invalid or expired, this call will fail (e.g., 401 error).
      // We do nothing, and the user remains logged out.
      console.log("No valid session found.");
      setUser(null);
    } finally {
      // We are done checking, so we set loading to false.
      setLoading(false);
    }
  }, []);

  // This runs ONCE when the app first loads.
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const toggleBalanceVisibility = useCallback(() => { setIsBalanceHidden(prevState => !prevState) }, []);

  // The refreshToken function is no longer needed by child components, but checkAuthStatus serves a similar purpose.
  const value = useMemo(() => ({ 
    user, loading, isBalanceHidden, toggleBalanceVisibility, login, logout, checkAuthStatus 
  }), [user, loading, isBalanceHidden, toggleBalanceVisibility, login, logout, checkAuthStatus]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
