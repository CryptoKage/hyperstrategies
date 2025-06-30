import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // This effect runs when the app loads to verify the token and get user data
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        // We'll add an endpoint to get user data later, for now we'll fake it
        // For simplicity, we'll assume the token is valid if it exists.
        // In a real app, you'd have a '/api/auth/me' endpoint.
        setIsLoggedIn(true);
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    };
    verifyToken();
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  // The value that will be available to all children components
  const value = { isLoggedIn, token, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create a custom hook to use the context easily
export const useAuth = () => {
  return useContext(AuthContext);
};