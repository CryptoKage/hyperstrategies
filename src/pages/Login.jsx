// src/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/api'; // ✅ 1. Import our configured api instance
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import GoogleIcon from '../components/GoogleIcon';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ 2. This effect checks for the success message from the registration page
  useEffect(() => {
    if (searchParams.get('status') === 'registered') {
      setSuccessMessage('Registration successful! Please sign in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // ✅ 3. Use our configured 'api' instance for the login call
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      login(response.data.token); // This sets the user state
      navigate('/dashboard'); // Navigate on success

    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // We get the base URL directly from our configured api instance
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  };

  return (
    <Layout>
      <div className="auth-wrapper">
        <div className="auth-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Sign In</h2>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                autoComplete="email"
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          <div className="social-login">
            <button onClick={handleGoogleLogin} className="btn-google">
              <GoogleIcon />
              <span>Sign in with Google</span>
            </button>
          </div>
           <p className="auth-link">
             Don't have an account? <Link to="/register">Register</Link>
           </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;