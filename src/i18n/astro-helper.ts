import { Language, getTranslations, t as translate, getStoredLanguage } from './index';

export function getLanguageFromRequest(request: Request): Language {
  // Try to get language from cookie first
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => c.split('='))
    );
    const lang = cookies['my10xCards_language'];
    if (lang === 'pl' || lang === 'en') {
      return lang;
    }
  }
  
  // Try Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage?.toLowerCase().includes('pl')) {
    return 'pl';
  }
  
  return 'en';
}

export function createTranslator(lang: Language) {
  const translations = getTranslations(lang);
  
  return {
    t: (path: string, params?: Record<string, any>) => translate(translations, path, params),
    lang,
    translations,
  };
}