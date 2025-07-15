// src/pages/Register.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import InputField from '../components/InputField'; // Assuming you are using this

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // State to hold the referral code from the URL
  const [referralCode, setReferralCode] = useState('');
  
  // React Router hook to read URL query parameters
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // This effect runs only once when the page first loads
  useEffect(() => {
    // Check if the URL has a '?ref=...' parameter
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      console.log(`Referral code detected in URL: ${refCode}`);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Send the referralCode to the backend along with the other user data
      await axios.post('/api/auth/register', {
        username,
        email,
        password,
        referralCode // This will be an empty string if none was found in the URL
      });
      // On success, guide the user to the login page
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <Layout>
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          
          {/* If a referral code is present, display a confirmation message */}
          {referralCode && (
            <div className="info-box">
              <span>You were referred by code: <strong>{referralCode}</strong></span>
            </div>
          )}
          
          {error && <p className="error-message">{error}</p>}
          
          <InputField
            label="Username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <InputField
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Create Account</button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </Layout>
  );
};

export default Register;