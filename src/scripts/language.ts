export function setLanguageCookie(language: string) {
  document.cookie = `my10xCards_language=${language}; path=/; max-age=31536000; SameSite=Lax`;
  localStorage.setItem('my10xCards_language', language);
}