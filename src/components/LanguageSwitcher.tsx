import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { languages } from '../i18n';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      {Object.entries(languages).map(([code, lang]) => (
        <button
          key={code}
          onClick={() => setLanguage(code as 'pl' | 'en')}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium transition-colors
            ${language === code 
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