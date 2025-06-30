import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations, getTranslations, getStoredLanguage, setStoredLanguage, t as translate } from './index';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Translations;
  t: (path: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({ children, defaultLanguage }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage || 'pl');
  const [translations, setTranslations] = useState<Translations>(getTranslations(defaultLanguage || 'pl'));

  useEffect(() => {
    // On client side, get stored language
    const storedLang = getStoredLanguage();
    if (storedLang !== language) {
      setLanguageState(storedLang);
      setTranslations(getTranslations(storedLang));
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setTranslations(getTranslations(lang));
    setStoredLanguage(lang);
    
    // Set cookie for server-side rendering
    document.cookie = `my10xCards_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Reload the page to update server-rendered content
    window.location.reload();
  };

  const t = (path: string, params?: Record<string, any>) => {
    return translate(translations, path, params);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}