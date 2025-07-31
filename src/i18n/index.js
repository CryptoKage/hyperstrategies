// src/i18n/index.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// --- DIRECTLY IMPORT your JSON files ---
import enTranslations from './en.json';
import deTranslations from './de.json';

i18n
  .use(initReactI18next)
  .init({
    // --- We provide the resources directly ---
    resources: {
      en: {
        translation: enTranslations
      },
      de: {
        translation: deTranslations
      },
    },
    lng: 'en', // default language
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;