// ==============================================================================
// FINAL, RESILIENT VERSION: PASTE THIS to replace your entire AuthContext.js
// ==============================================================================
import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const login = useCallback((token) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      const decoded = jwtDecode(token);
      // --- FIX #1: Handle different JWT payload shapes (as recommended by scanner) ---
      setUser(decoded.user || decoded);
    } catch (err) {
      console.error("Failed to decode token on login:", err);
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      const newToken = response.data.token;
      if (newToken) {
        login(newToken);
        console.log('[AuthContext] Token has been refreshed with updated user data.');
      } else {
        logout();
      }
    } catch (error) {
      // --- FIX #2: Make logout logic less aggressive (as recommended by scanner) ---
      console.error('Failed to refresh token:', error);
      // ONLY log out if the error is a 401 Unauthorized, which means the token is truly invalid/expired.
      // For any other error (like a 403 or 500), we do nothing, allowing the user to stay logged in with their existing token.
      if (error.response && error.response.status === 401) {
        logout();
      }
    }
  }, [login, logout]);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await refreshToken();
      }
      setLoading(false);
    };
    bootstrapAuth();
  }, [refreshToken]); // This hook now correctly depends on refreshToken

  const toggleBalanceVisibility = useCallback(() => { setIsBalanceHidden(prevState => !prevState) }, []);

  const value = useMemo(() => ({ 
    user, loading, isBalanceHidden, toggleBalanceVisibility, login, logout, refreshToken
  }), [user, loading, isBalanceHidden, toggleBalanceVisibility, login, logout, refreshToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
// ==============================================================================
// END OF FILE REPLACEMENT
// ==============================================================================
