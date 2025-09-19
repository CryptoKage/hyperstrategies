import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import './styles/global.css'; // Your main styles
import Router from './pages/Router';
import './i18n'; // Initializes i18next
import { AnimationSettingsProvider } from './context/AnimationSettingsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AnimationSettingsProvider>
          <Router />
        </AnimationSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

serviceWorkerRegistration.unregister();
