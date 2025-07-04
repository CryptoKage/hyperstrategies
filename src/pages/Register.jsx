import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import GoogleIcon from '../components/GoogleIcon';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || 'https://hyperstrategies-backend.onrender.com/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(`${backendUrl}/auth/register`, {
        username,
        email,
        password,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    if (!backendUrl) {
      alert('Backend URL is missing. Please check environment variables.');
      return;
    }

    const redirectUrl = `${backendUrl}/auth/google`;
    console.log('Redirecting to:', redirectUrl);
    window.location.href = redirectUrl;
  };

  return (
    <Layout>
      <div className="auth-wrapper">{/* ✅ New wrapper for centering */}
        <div className="auth-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Create Account</h2>
            {error && <p className="error-message">{error}</p>}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

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

            <button type="submit" className="btn-primary">Create Account</button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          <div className="social-login">
            <button onClick={handleGoogleLogin} className="btn-google">
              <GoogleIcon />
              <span>Sign up with Google</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
