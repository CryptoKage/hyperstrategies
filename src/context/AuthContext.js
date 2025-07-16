// src/context/AuthContext.js

import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.user);
      } catch (err) {
        console.error("Invalid token on initial load:", err);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((token) => {
    localStorage.setItem('token', token);
    try {
      const decoded = jwtDecode(token);
      
      // ✅ THE FIX: Use the correct variable name 'decoded'
      console.log('[AuthContext] User state SET. isAdmin status:', decoded.user.isAdmin);
      
      setUser(decoded.user);
    } catch (err) {
      console.error("Failed to decode token on login:", err);
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);
  
  const toggleBalanceVisibility = useCallback(() => {
    setIsBalanceHidden(prevState => !prevState);
  }, []);

  const value = useMemo(() => ({ 
    user, 
    loading,
    isBalanceHidden,
    toggleBalanceVisibility,
    login, 
    logout
  }), [user, loading, isBalanceHidden, toggleBalanceVisibility, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);