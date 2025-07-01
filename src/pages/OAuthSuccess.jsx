// src/pages/OAuthSuccess.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthSuccess = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get('token');

    if (token) {
      login(token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [login, navigate]);

  return <p>Logging you in...</p>;
};

export default OAuthSuccess;
