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
import ReactGA from 'react-ga4';
import ReactPixel from 'react-facebook-pixel'; 
import './styles/reports.css';

const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log("Google Analytics initialized.");
}

const META_PIXEL_ID = process.env.REACT_APP_META_PIXEL_ID;
if (META_PIXEL_ID) {
    const options = {
        autoConfig: true, // Self-configures based on the DOM
        debug: false,     // Set to true for development debugging
    };
    ReactPixel.init(META_PIXEL_ID, undefined, options);
    ReactPixel.pageView(); // Fire a page view for the initial load
    console.log("Meta Pixel initialized.");
}

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
