// FINAL DEFINITIVE src/context/AuthContext.js

import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';

const AuthContext = createContext(null);

const APP_DOMAIN = 'app.hyper-strategies.com';
const WWW_DOMAIN = 'www.hyper-strategies.com';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const login = useCallback((userData) => {
    setUser(userData);
    // After login, always navigate to the dashboard path.
    // The redirect logic in the useEffect will handle the domain jump.
    navigate('/dashboard');
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout API call failed, clearing user state anyway.", error);
    } finally {
      setUser(null);
      // After logout, always force a redirect to the marketing homepage.
      if (IS_PRODUCTION) {
        window.location.replace(`https://${WWW_DOMAIN}/`);
      } else {
        navigate('/');
      }
    }
  }, [navigate]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      setUser(response.data.user);
    } catch (error) {
      console.log("No valid session found.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // This is the SINGLE SOURCE OF TRUTH for redirects.
  useEffect(() => {
    if (loading) return; // Do nothing until we know the auth state.

    if (IS_PRODUCTION) {
      const currentDomain = window.location.hostname;
      const isAuthenticated = !!user;

      // RULE 1: If logged in, MUST be on app domain.
      if (isAuthenticated && currentDomain !== APP_DOMAIN) {
        // Only redirect if not in the middle of an oauth callback
        if (!location.pathname.startsWith('/oauth-success')) {
          console.log("Redirecting logged-in user to APP domain...");
          window.location.replace(`https://${APP_DOMAIN}${location.pathname}`);
        }
      }

      // RULE 2: If logged out and on app domain, MUST be on a public/guest page.
      if (!isAuthenticated && currentDomain === APP_DOMAIN) {
        const allowedGuestPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/oauth-success'];
        // If the current path is NOT one of the allowed guest paths, redirect.
        if (!allowedGuestPaths.some(path => location.pathname.startsWith(path))) {
          console.log("Redirecting logged-out user on APP domain to login page...");
          navigate('/login');
        }
      }
    }
  }, [user, loading, location, navigate]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const toggleBalanceVisibility = useCallback(() => setIsBalanceHidden(prevState => !prevState), []);

  const value = useMemo(() => ({ 
    user, 
    isAuthenticated: !!user, // Provide a convenient boolean
    isLoading: loading, 
    isBalanceHidden, 
    toggleBalanceVisibility, 
    login, 
    logout, 
    checkAuthStatus 
  }), [user, loading, isBalanceHidden, toggleBalanceVisibility, login, logout, checkAuthStatus]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
