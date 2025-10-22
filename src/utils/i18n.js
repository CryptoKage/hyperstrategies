import en from '../i18n/en.json';
import de from '../i18n/de.json';
import troll from '../i18n/troll.json';

const dict = { en, de, troll };

export const T = (key, locale = 'en') => {
  const segments = key.split('.');

  const resolve = (lang) => {
    let value = dict[lang];
    for (const segment of segments) {
      if (value == null) {
        return undefined;
      }
      value = value[segment];
    }
    return value;
  };

  const localized = resolve(locale);
  if (localized != null && typeof localized === 'string') {
    return localized;
  }

  const fallback = resolve('en');
  return typeof fallback === 'string' ? fallback : key;
};

export const SUPPORTED_LOCALES = Object.keys(dict);
