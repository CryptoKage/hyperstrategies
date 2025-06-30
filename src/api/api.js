// src/api/api.js
import axios from 'axios';

// Create a new instance of axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend's base URL
});

// This is the magic part. We're adding an "interceptor"
// that runs before every single request this instance of axios makes.
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // If there's an error, just pass it along
    return Promise.reject(error);
  }
);

export default api;