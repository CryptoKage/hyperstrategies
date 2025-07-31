// src/i18n/index.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// --- NEW --- Import a backend to load files
import HttpApi from 'i18next-http-backend';
// --- NEW --- Import a language detector
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // --- NEW --- These two plugins add more robust functionality
  .use(HttpApi) // Loads translations from your /public/locales folder
  .use(LanguageDetector) // Detects user's browser language
  .use(initReactI18next)
  .init({
    // --- NEW --- Use Suspense for loading states
    supportedLngs: ['en', 'de'],
    fallbackLng: 'en',
    debug: false, // Set to true for debugging in development
    
    // Configure where the translations are located
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },

    // --- NEW --- This is the key that enables the fix
    react: {
      useSuspense: true,
    },
  });

export default i18n;