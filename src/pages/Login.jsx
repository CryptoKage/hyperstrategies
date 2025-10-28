// src/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { request } from '../api/request'; // NEW: Import our request wrapper
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import GoogleIcon from '../components/GoogleIcon';
import InputField from '../components/InputField';
import { notifyByKey } from '../utils/notify'; // NEW: For non-API messages

const Login = () => {
  const { t } = useTranslation();
  const [referralCode, setReferralCode] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    const session = searchParams.get('session');
    const refCode = searchParams.get('ref');

    if (refCode) setReferralCode(refCode);

    // We now use our notification system for these messages
    if (status === 'registered') {
      notifyByKey('success', 'toasts.REGISTER_SUCCESS');
    }
    if (status === 'reset_success') {
      notifyByKey('success', 'toasts.RESET_PASSWORD_SUCCESS');
    }
    if (session === 'expired') {
      notifyByKey('error', 'errors.SESSION_EXPIRED');
    }

    // Clean the URL so the message doesn't reappear on refresh
    if (status || session) {
      navigate('/login', { replace: true });
    }
  }, [searchParams, t, navigate]);

  // --- REFACTORED: handleSubmit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the new request wrapper. Success toast is automatic.
      const response = await request('/auth/login', {
        method: 'POST',
        data: { email, password },
      });
     
      if (response && response.user) {
        login(response.user); 
        navigate('/dashboard');
      } else {
        // This is a fallback for an unexpected success response format
        throw new Error('Login response was malformed.');
      }
    } catch (err) {
      // Error toast is already handled by the request wrapper.
      console.error("Login failed:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (referralCode) {
      window.location.href = `${process.env.REACT_APP_API_URL}/auth/google?ref=${referralCode}`;
    } else {
      window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
    }
  };

  return (
    <Layout>
      <div className="auth-wrapper">
        <div className="auth-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>{t('login_page.title')}</h2>
            
            {/* We no longer need the local error/success message paragraphs */}
            
            <InputField 
              label={t('login_page.email_label')} 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <InputField 
              label={t('login_page.password_label')} 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            
            <div className="auth-options">
              <Link to="/forgot-password" className="forgot-password-link">
                {t('login_page.forgot_password_link')}
              </Link>
            </div>
            
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? t('login_page.button_signing_in') : t('login_page.button_signin')}
            </button>
          </form>

          <div className="auth-divider">
            <span>{t('login_page.divider')}</span>
          </div>

          <div className="social-login">
            <button onClick={handleGoogleLogin} className="btn-google">
              <GoogleIcon />
              <span>{t('login_page.google_signin')}</span>
            </button>
          </div>
           <p className="auth-link">
             {t('login_page.register_prompt')}{' '}
             <Link to="/register">{t('login_page.register_link')}</Link>
           </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
