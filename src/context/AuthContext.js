// ==============================================================================
// FINAL, FULL VERSION: PASTE THIS to replace your entire AuthContext.js file
// ==============================================================================
import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api'; // <-- IMPORTANT: We need to import the api instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  // --- Step 1: Define the core login/logout functions first ---
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

  // --- Step 2: Define our new refresh token function ---
  const refreshToken = async () => {
    try {
      const response = await api.post('/api/auth/refresh-token');

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
  };
  
  // --- Step 3: Define the initial loading effect ---
  useEffect(() => {
    const refreshOnLoad = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // We set the auth header first, so our refresh token call is authenticated
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await refreshToken(); // Call our new function
      }
      setLoading(false);
    };
    refreshOnLoad();
  }, []); // This effect should only run once on initial load

  const toggleBalanceVisibility = useCallback(() => {
    setIsBalanceHidden(prevState => !prevState);
  }, []);

  // --- Step 4: Add refreshToken to the exported value ---
  const value = useMemo(() => ({ 
    user, 
    loading,
    isBalanceHidden,
    toggleBalanceVisibility,
    login, 
    logout,
    refreshToken // <-- Export the new function
  }), [user, loading, isBalanceHidden, toggleBalanceVisibility, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
// ==============================================================================
// END OF FILE REPLACEMENT
// ==============================================================================
