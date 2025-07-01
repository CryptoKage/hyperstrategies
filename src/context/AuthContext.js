// src/context/AuthContext.js

import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ⬅️ Add loading guard

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
    setLoading(false); // ✅ only set after checking token once
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

  const value = useMemo(() => ({ user, login, logout, loading }), [user, login, logout, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
