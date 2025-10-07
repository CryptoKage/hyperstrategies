// src/api/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // This enables automatic cookie handling
});

// The request interceptor for Authorization has been REMOVED.

// Your response interceptor for handling 401/403 errors is fine to keep,
// but we will improve its logout logic in the AuthContext.
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Instead of handling logout here, we let the original caller handle it.
      // The AuthContext will catch this and decide to log out.
      // This prevents a hard redirect from a background API call.
      console.warn("Authentication error detected on API call.");
    }
    return Promise.reject(error);
  }
);

export default api;
