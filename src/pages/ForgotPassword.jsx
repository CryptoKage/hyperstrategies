// src/pages/ForgotPassword.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { request } from '../api/request'; // NEW: Import our request wrapper
import Layout from '../components/Layout';
import InputField from '../components/InputField';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the new request wrapper. The success toast will now show automatically.
      await request('/auth/forgot-password', {
        method: 'POST',
        data: { email },
      });
      
      // On success, we just change the UI to show the "Check your email" message.
      setIsSubmitted(true);
    } catch (err) {
      // The request wrapper will show a generic error if something goes wrong,
      // but for security, we don't show specific errors on this page.
      console.error("Forgot password request failed:", err.message);
      // We can even force the UI to show the success state on error to prevent email enumeration.
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="auth-wrapper">
        <div className="auth-container">
          {isSubmitted ? (
            <div className="auth-form">
              <h2>{t('forgot_password_page.success_title')}</h2>
              {/* The text here is now the same as the toast message */}
              <p className="success-message">{t('toasts.FORGOT_PASSWORD_SUCCESS')}</p>
              <Link to="/login" className="btn-primary" style={{marginTop: '20px', textAlign: 'center'}}>
                {t('forgot_password_page.back_to_login')}
              </Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <h2>{t('forgot_password_page.title')}</h2>
              <p className="form-description">{t('forgot_password_page.description')}</p>
              
              {/* We no longer need a local error message display */}

              <InputField 
                label={t('forgot_password_page.email_label')} 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? t('forgot_password_page.button_sending') : t('forgot_password_page.button_send')}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
