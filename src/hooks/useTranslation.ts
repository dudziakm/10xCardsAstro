import { useState, useEffect } from 'react';
import { getStoredLanguage, getTranslations, t as translate, type Language, type Translations } from '../i18n';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>('pl');
  const [translations, setTranslations] = useState<Translations>(() => getTranslations('pl'));

  useEffect(() => {
    const storedLang = getStoredLanguage();
    setLanguage(storedLang);
    setTranslations(getTranslations(storedLang));

    // Listen for language changes via storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'my10xCards_language' && e.newValue) {
        const newLang = e.newValue as Language;
        if (newLang === 'pl' || newLang === 'en') {
          setLanguage(newLang);
          setTranslations(getTranslations(newLang));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const t = (path: string, params?: Record<string, any>) => {
    return translate(translations, path, params);
  };

  return { t, language };
}