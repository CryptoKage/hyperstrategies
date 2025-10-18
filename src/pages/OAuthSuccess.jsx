// src/pages/OAuthSuccess.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const OAuthSuccess = () => {
  const { t } = useTranslation();
  const { checkAuthStatus, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // This effect runs when the component mounts.
    // We wait until the initial loading of the AuthContext is finished.
    if (isLoading) {
      return; // Do nothing if the context is still loading its initial state.
    }

    const verifyLogin = async () => {
      // The cookie was set by the server on the previous step.
      // Now, we tell our AuthContext to re-check its status.
      // `checkAuthStatus` will call the `/refresh-token` endpoint, which will succeed
      // because the browser will send the new cookie. The context will then be updated with the user's data.
      if (checkAuthStatus) {
        await checkAuthStatus();
      }
      
      // Once the auth state is updated, we can safely navigate to the dashboard.
      // The `replace: true` option prevents the user from clicking "back" to this page.
      navigate('/dashboard', { replace: true });
    };

    verifyLogin();
  }, [isLoading, checkAuthStatus, navigate]);

  // Show a simple loading message to the user while the redirect happens.
  return <p>{t('oauth_success.logging_in', 'Finalizing login...')}</p>;
};

export default OAuthSuccess;
