// src/pages/ResetPassword.jsx.

import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Layout from '../components/Layout';
import InputField from '../components/InputField';

const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError(t('reset_password_page.error_match'));
      return;
    }
    if (!token) {
      setError(t('reset_password_page.error_no_token'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password,
      });
      setSuccessMessage(response.data.message);
      // Redirect to login page after a short delay so the user can see the success message
      setTimeout(() => {
        navigate('/login?status=reset_success');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || t('reset_password_page.error_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="auth-wrapper">
        <div className="auth-container">
          {successMessage ? (
            <div className="auth-form">
              <h2>{t('reset_password_page.success_title')}</h2>
              <p className="success-message">{successMessage}</p>
              <Link to="/login" className="btn-primary" style={{marginTop: '20px', textAlign: 'center'}}>
                {t('reset_password_page.login_now')}
              </Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <h2>{t('reset_password_page.title')}</h2>
              <p className="form-description">{t('reset_password_page.description')}</p>
              
              {error && <p className="error-message">{error}</p>}
              
              <InputField 
                label={t('reset_password_page.password_label')} 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <InputField 
                label={t('reset_password_page.confirm_password_label')} 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
              
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? t('reset_password_page.button_updating') : t('reset_password_page.button_update')}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
