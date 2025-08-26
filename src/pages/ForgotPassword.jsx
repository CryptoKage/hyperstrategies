// src/pages/ForgotPassword.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Layout from '../components/Layout';
import InputField from '../components/InputField';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      setIsSubmitted(true); // This will hide the form and only show the message
    } catch (err) {
      setError(err.response?.data?.error || t('forgot_password_page.error_failed'));
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
              <p className="success-message">{message}</p>
              <Link to="/login" className="btn-primary" style={{marginTop: '20px', textAlign: 'center'}}>
                {t('forgot_password_page.back_to_login')}
              </Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <h2>{t('forgot_password_page.title')}</h2>
              <p className="form-description">{t('forgot_password_page.description')}</p>
              
              {error && <p className="error-message">{error}</p>}
              
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
