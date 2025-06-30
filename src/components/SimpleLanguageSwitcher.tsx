import React from 'react';
import { languages, type Language } from '../i18n';

interface SimpleLanguageSwitcherProps {
  currentLanguage: Language;
}

export function SimpleLanguageSwitcher({ currentLanguage }: SimpleLanguageSwitcherProps) {
  const handleLanguageChange = (lang: Language) => {
    // Set cookie and localStorage
    document.cookie = `my10xCards_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem('my10xCards_language', lang);
    
    // Reload page to update server-rendered content
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      {Object.entries(languages).map(([code, lang]) => (
        <button
          key={code}
          onClick={() => handleLanguageChange(code as Language)}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium transition-colors
            ${currentLanguage === code 
              ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100' 
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }
          `}
          aria-label={`Switch to ${lang.name}`}
        >
          <span className="text-lg" role="img" aria-label={`${lang.name} flag`}>
            {lang.flag}
          </span>
          <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}