// src/context/AuthContext.js

import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ 1. NEW: State to manage balance visibility
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.user);
      } catch (err) {
        console.error("Invalid token:", err);
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
      setUser(decoded.user);
    } catch {
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);
  
  // ✅ 2. NEW: Function to toggle the visibility state
  const toggleBalanceVisibility = useCallback(() => {
    setIsBalanceHidden(prevState => !prevState);
  }, []);

  // ✅ 3. NEW: Add the new state and function to the context's value
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