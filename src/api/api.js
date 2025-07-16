// src/api/api.js
import axios from 'axios';

// This is the key: It reads the variable from your Vercel environment.
// If the variable doesn't exist (like on your local machine), it defaults to localhost.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log(`[API] Using base URL: ${API_URL}`); // A handy log to confirm the URL

const api = axios.create({
  baseURL: API_URL,
});

// This interceptor automatically attaches the auth token to every request.
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

export default api;