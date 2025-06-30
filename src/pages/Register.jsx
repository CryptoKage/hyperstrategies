// src/pages/Register.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

const Register = () => {
  // We need state for all three fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // We must send all three fields to the backend
      await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password,
      });

      // After a successful registration, guide the user to the login page
      // so they can sign in with their new credentials.
      navigate('/login');

    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          {error && <p className="error-message">{error}</p>}

          {/* This is the missing input field */}
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
      </div>
    </Layout>
  );
};

export default Register;