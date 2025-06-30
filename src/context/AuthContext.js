// src/context/AuthContext.js

import React, { createContext, useState, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

// 1. Define a function to get the initial state. This runs synchronously.
const getInitialState = () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      // If a valid token exists, the initial user is the decoded user.
      return jwtDecode(token).user;
    }
    // Otherwise, the initial user is null.
    return null;
  } catch (e) {
    // If token is invalid, start with no user.
    return null;
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 2. Initialize the user state by calling our function. NO FLICKER.
  const [user, setUser] = useState(getInitialState);

  // The login function is now very simple.
  const login = (token) => {
    localStorage.setItem('token', token);
    try {
      setUser(jwtDecode(token).user);
    } catch (e) {
      console.error("Failed to decode token on login", e);
      setUser(null); // Ensure user is null if token is bad
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // The user object is now correct from the very first render.
  const value = { user, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};