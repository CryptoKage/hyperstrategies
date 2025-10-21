// src/i18n/index.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// --- DIRECTLY IMPORT your JSON files ---
import enTranslations from './en.json';
import deTranslations from './de.json';
import euTranslations from './eu.json';
import trollTranslations from './troll.json'; // --- THE FIX 1: Import the new troll translations ---

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
      eu: {
        translation: euTranslations
      },
      // --- THE FIX 2: Add the 'troll' language to the resources master list ---
      troll: {
        translation: trollTranslations
      },
    },
    lng: 'en', // default language
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
