import plTranslations from './pl.json';
import enTranslations from './en.json';

export type Language = 'pl' | 'en';

export const languages = {
  pl: {
    code: 'pl',
    name: 'Polski',
    flag: '🇵🇱',
    translations: plTranslations,
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    translations: enTranslations,
  },
};

export type Translations = typeof plTranslations;

export function getTranslations(lang: Language): Translations {
  return languages[lang].translations;
}

// Helper function to get nested translation value
export function t(translations: Translations, path: string, params?: Record<string, any>): string {
  const keys = path.split('.');
  let value: any = translations;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      console.warn(`Translation missing for path: ${path}`);
      return path;
    }
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string for path: ${path}`);
    return path;
  }
  
  // Replace parameters like {{count}} with actual values
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      value = value.replace(new RegExp(`{{${key}}}`, 'g'), String(val));
    });
  }
  
  return value;
}

// Client-side language management
export const LANGUAGE_KEY = 'my10xCards_language';

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'pl';
  
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored && (stored === 'pl' || stored === 'en')) {
    return stored as Language;
  }
  
  // Detect browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('pl')) return 'pl';
  return 'en';
}

export function setStoredLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANGUAGE_KEY, lang);
}