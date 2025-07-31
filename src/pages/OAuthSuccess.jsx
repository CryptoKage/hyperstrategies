// src/pages/OAuthSuccess.jsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const OAuthSuccess = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const query = new URLSearchParams(window.location.search);
      const token = query.get('token');

      if (!token) {
        console.error('❌ Token is missing from URL');
        return navigate('/login');
      }

      console.log('✅ Received token from Google OAuth:', token);
      login(token);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);

    } catch (err) {
      console.error('❌ Error handling OAuth redirect:', err);
      navigate('/login');
    }
  }, [login, navigate]);

  return <p>{t('oauth_success.logging_in')}</p>;
};

export default OAuthSuccess;