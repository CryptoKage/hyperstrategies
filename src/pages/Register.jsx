// src/pages/Register.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Import
import api from '../api/api';
import Layout from '../components/Layout';
import InputField from '../components/InputField';
import GoogleIcon from '../components/GoogleIcon';

const Register = () => {
  const { t } = useTranslation(); // 2. Initialize
  
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
      await api.post('/auth/register', { username, email, password, referralCode });
      navigate('/login?status=registered');
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || t('register_page.error_unexpected'));
      } else {
        setError(t('register_page.error_server'));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = () => {
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  };

  return (
    <Layout>
      <div className="auth-wrapper">
        <div className="auth-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>{t('register_page.title')}</h2>
            
            {referralCode && (
              <div className="info-box">
                <span dangerouslySetInnerHTML={{ __html: t('register_page.referred_by', { code: referralCode }) }} />
              </div>
            )}
            
            {error && <p className="error-message">{error}</p>}
            
            <InputField label={t('register_page.username_label')} id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <InputField label={t('register_page.email_label')} id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <InputField label={t('register_page.password_label')} id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? t('register_page.button_creating') : t('register_page.button_create')}
            </button>
          </form>

          <div className="auth-divider">
            <span>{t('register_page.divider')}</span>
          </div>

          <div className="social-login">
            <button onClick={handleGoogleLogin} className="btn-google">
              <GoogleIcon />
              <span>{t('register_page.google_signup')}</span>
            </button>
          </div>

          <p className="auth-link">
            {t('register_page.login_prompt')}{' '}
            <Link to="/login">{t('register_page.login_link')}</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Register;