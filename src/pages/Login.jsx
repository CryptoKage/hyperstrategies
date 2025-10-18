// src/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import GoogleIcon from '../components/GoogleIcon';
import InputField from '../components/InputField';

const Login = () => {
  const { t } = useTranslation();
  const [referralCode, setReferralCode] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    const session = searchParams.get('session');

     const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }

    if (status === 'registered') {
      setSuccessMessage(t('login_page.success_message'));
    }
    if (status === 'reset_success') {
      setSuccessMessage(t('login_page.reset_success'));
    }
    if (session === 'expired') {
      setError(t('login_page.session_expired'));
    }
  }, [searchParams, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
     
        if (response.data.user) {
            login(response.data.user); 
navigate('/dashboard');
        } else {
             setError(t('login_page.error_failed'));
        }
    } catch (err) {
      setError(err.response?.data?.error || t('login_page.error_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (referralCode) {
      window.location.href = `${api.defaults.baseURL}/auth/google?ref=${referralCode}`;
    } else {
      window.location.href = `${api.defaults.baseURL}/auth/google`;
    }
  };

  return (
    <Layout>
      <div className="auth-wrapper">
        <div className="auth-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>{t('login_page.title')}</h2>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {error && <p className="error-message">{error}</p>}
            
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
