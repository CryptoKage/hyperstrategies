export type Locale = 'en' | 'de' | 'troll';

import en from '@/i18n/en.json';
import de from '@/i18n/de.json';
import troll from '@/i18n/troll.json';

type Dictionary = Record<Locale, any>;

const dict: Dictionary = { en, de, troll };

export const T = (key: string, locale: Locale = 'en'): string => {
  const segments = key.split('.');

  const resolve = (lang: Locale) => {
    let value: any = dict[lang];
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
