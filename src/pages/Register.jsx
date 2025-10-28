// src/pages/Register.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { request } from '../api/request'; // NEW: Import our request wrapper
import Layout from '../components/Layout';
import InputField from '../components/InputField';
import GoogleIcon from '../components/GoogleIcon';

const Register = () => {
  const { t } = useTranslation();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // --- REFACTORED: handleSubmit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // All the magic happens here. Toasts are now automatic.
      await request('/auth/register', {
        method: 'POST',
        data: { username, email, password, referralCode },
      });
      
      // On success, navigate to the login page with a status
      navigate('/login?status=registered');

    } catch (err) {
      // The request wrapper has already shown the error toast.
      // We can log the error if we want, but no UI updates are needed here.
      console.error("Registration failed:", err.message);
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
            <h2>{t('register_page.title')}</h2>
            
            {referralCode && (
              <div className="info-box">
                <span>
                  {t('register_page.referred_by_text_only')} <strong>{referralCode}</strong>
                </span>
              </div>
            )}  
            
            {/* NOTE: We no longer need the {error && ...} paragraph. Toasts handle this now. */}
            
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
