// src/api/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// --- This is your existing, working request interceptor ---
// It attaches the auth token to every outgoing request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// --- THIS IS THE NEW RESPONSE INTERCEPTOR ---
// It checks every incoming response for authentication errors.
api.interceptors.response.use(
  // The first function handles successful responses (status 2xx).
  // We just pass them through without doing anything.
  (response) => {
    return response;
  },
  // The second function handles error responses (status 3xx, 4xx, 5xx).
  (error) => {
    // We check if the error response exists and has a status code.
    if (error.response) {
      // This is the core logic: check for 401 (Unauthorized) or 403 (Forbidden).
      if (error.response.status === 401 || error.response.status === 403) {
        console.warn("Authentication error detected, logging user out.", error.response.data);
        
        // Remove the invalid token.
        localStorage.removeItem('token');

        // Redirect the user to the login page.
        // We use window.location.href to force a full page reload, which clears all app state.
        // We add a query parameter to show a message on the login screen.
        window.location.href = '/login?session=expired'; 
      }
    }
    
    // For any other kind of error, we just pass it along to be handled by the component.
    return Promise.reject(error);
  }
);


export default api;
