// src/index.js

import React, { Suspense } from 'react'; // 1. Import Suspense
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import './styles/global.css';
import Router from './pages/Router';
import './i11n'; // Make sure this is imported to initialize i18next

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. Wrap your entire application with the Suspense component */}
    <Suspense fallback={<div>Loading translations...</div>}>
      <BrowserRouter>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);

serviceWorkerRegistration.register();