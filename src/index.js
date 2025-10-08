// /src/index.js
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FeatureFlagProvider } from './context/FeatureFlagContext';
import { AnimationSettingsProvider } from './context/AnimationSettingsContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './styles/global.css';
import Router from './pages/Router';
import { Toaster } from 'react-hot-toast';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <AuthProvider>
          <FeatureFlagProvider>
            <AnimationSettingsProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                  },
                }}
                />
              <Router />
            </AnimationSettingsProvider>
          </FeatureFlagProvider>
        </AuthProvider>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);

serviceWorkerRegistration.unregister();
