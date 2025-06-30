// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <-- IMPORT THE PROVIDER

import './styles/global.css';
import './index.css';
import Router from './pages/Router';
import './i18n';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthProvider> {/* <-- WRAP YOUR ROUTER */}
      <Router />
    </AuthProvider>
  </BrowserRouter>
);

serviceWorkerRegistration.unregister();