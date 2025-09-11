// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css'; 
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import './styles/tailwind.css'; 
import './styles/global.css';  
import Router from './pages/Router';
import './i18n'; // This still initializes our i18n configuration

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

serviceWorkerRegistration.register();
