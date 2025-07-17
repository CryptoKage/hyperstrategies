// src/pages/Register.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/api';
import Layout from '../components/Layout';
import InputField from '../components/InputField';
import GoogleIcon from '../components/GoogleIcon'; // 1. Import the GoogleIcon

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/register', {
        username,
        email,
        password,
        referralCode
      });
      navigate('/login?status=registered');
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'An unexpected error occurred.');
      } else {
        setError('Cannot connect to the server. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // 2. Add the handler for Google login
  const handleGoogleLogin = () => {
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  };

  return (
    <Layout>
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          
          {referralCode && (
            <div className="info-box">
              <span>You were referred by code: <strong>{referralCode}</strong></span>
            </div>
          )}
          
          {error && <p className="error-message">{error}</p>}
          
          <InputField label="Username" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <InputField label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <InputField label="Password" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* --- ✅ 3. ADDED BACK: The divider and Google button --- */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="social-login">
          <button onClick={handleGoogleLogin} className="btn-google">
            <GoogleIcon />
            <span>Sign up with Google</span>
          </button>
        </div>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </Layout>
  );
};

export default Register;