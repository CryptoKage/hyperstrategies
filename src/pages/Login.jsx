// src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import GoogleIcon from '../components/GoogleIcon';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://hyperstrategies-backend.onrender.com/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${backendUrl}/login`, {
        email,
        password,
      });

      login(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    if (!backendUrl) {
      alert("Backend URL is missing. Please check environment variables.");
      return;
    }

    const redirectUrl = `${backendUrl}/auth/google`;
    console.log('Redirecting to:', redirectUrl);
    window.location.href = redirectUrl;
  };

  return (
    <Layout>
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Sign In</h2>
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary">Sign In</button>
        </form>

        <div className="auth-divider"><span>OR</span></div>

        <div className="social-login">
          <button onClick={handleGoogleLogin} className="btn-google">
            <GoogleIcon />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
