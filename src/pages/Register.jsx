import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Layout from '../components/Layout';
import InputField from '../components/InputField';
import GoogleIcon from '../components/GoogleIcon';

const Register = () => {
  const { t } = useTranslation();
  
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

  // --- THIS IS THE UPDATED FUNCTION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/register', { username, email, password, referralCode });
      navigate('/login?status=registered');
    } catch (err) {
      // New, more detailed error handling logic
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          // Handles validation errors from express-validator (e.g., "Password too weak")
          const firstError = err.response.data.errors[0];
          setError(firstError.msg); 
        } else if (err.response.data.error) {
          // Handles other custom errors from our backend (e.g., "Email already exists")
          setError(err.response.data.error);
        } else {
          // Fallback for other 400-level errors
          setError(t('register_page.error_unexpected'));
        }
      } else {
        // Fallback for network errors where there is no response object
        setError(t('register_page.error_server'));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
   const handleGoogleLogin = () => {
    // --- THIS IS THE FIX ---
    // We check if the 'referralCode' state variable has a value.
    if (referralCode) {
      // If it does, we append it as a query parameter to the login URL.
      window.location.href = `${api.defaults.baseURL}/auth/google?ref=${referralCode}`;
    } else {
      // Otherwise, we use the normal URL without the parameter.
      window.location.href = `${api.defaults.baseURL}/auth/google`;
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
      {/* 
        This is the fix. We render the translated text first, and then
        render the user-provided 'referralCode' safely inside a strong tag.
        This completely removes the dangerouslySetInnerHTML and the XSS risk.
      */}
      {t('register_page.referred_by_text_only')} <strong>{referralCode}</strong>
    </span>
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
