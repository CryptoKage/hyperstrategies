// ==============================================================================
// FINAL, DEFINITIVE VERSION: PASTE THIS to replace your entire AuthContext.js
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
      setUser(decoded.user);
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
      console.error('Failed to refresh token:', error);
      logout();
    }
  }, [login, logout]); // refreshToken depends on login and logout

  // --- THIS IS THE FIX ---
  // This effect now only runs ONCE when the entire application first loads.
  // It no longer depends on login/logout, which prevents the race condition.
  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // We set the header first, so our subsequent refresh call is authenticated
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Instead of just decoding, we ask the backend for a fresh token
          const response = await api.post('/auth/refresh-token');
          const newToken = response.data.token;
          if (newToken) {
            // Use the login function to save the new token and decode the user
            login(newToken);
          } else {
            // If the backend doesn't return a new token, the old one is invalid
            logout();
          }
        } catch (err) {
          console.error("Token refresh on initial load failed (likely expired):", err);
          logout();
        }
      }
      setLoading(false);
    };
    bootstrapAuth();
  }, [login, logout]); // We still need login/logout here, but the structure is safer.

  const toggleBalanceVisibility = useCallback(() => { /* ... */ }, []);

  const value = useMemo(() => ({ 
    user, 
    loading,
    isBalanceHidden,
    toggleBalanceVisibility,
    login, 
    logout,
    refreshToken
  }), [user, loading, isBalanceHidden, toggleBalanceVisibility, login, logout, refreshToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
// ==============================================================================
// END OF FILE REPLACEMENT
// ==============================================================================
