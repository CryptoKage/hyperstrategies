// src/pages/OAuthSuccess.jsx - CORRECTED VERSION

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // <-- 1. RE-IMPORT useTranslation

const OAuthSuccess = () => {
  const { t } = useTranslation(); // <-- 2. INITIALIZE the t function
  const { checkAuthStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyLogin = async () => {
      // The context needs to re-verify auth now that the cookie is set
      if (checkAuthStatus) {
        await checkAuthStatus();
      }
      navigate('/dashboard');
    };
    verifyLogin();
  }, [checkAuthStatus, navigate]);

  // --- 3. USE the t() function for the display text ---
  return <p>{t('oauth_success.logging_in', 'Finalizing login...')}</p>;
};

export default OAuthSuccess;
