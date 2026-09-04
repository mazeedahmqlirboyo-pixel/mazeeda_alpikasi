import { addMessages, init, getLocaleFromNavigator, locale } from 'svelte-i18n';
import en from './en.json';
import id from './id.json';
import ar from './ar.json';
import ja from './ja.json';
import zh from './zh.json';
import ko from './ko.json';

addMessages('en', en);
addMessages('id', id);
addMessages('ar', ar);
addMessages('ja', ja);
addMessages('zh', zh);
addMessages('ko', ko);

export function setupI18n() {
  let initialLocale = 'id';
  
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem('mazeeda_language');
    if (savedLocale) {
      initialLocale = savedLocale;
    } else {
      const navLocale = getLocaleFromNavigator();
      initialLocale = navLocale?.startsWith('en') ? 'en' : 'id';
    }
  }

  init({
    fallbackLocale: 'id',
    initialLocale,
  });
}

export function switchLanguage(newLocale: string) {
  locale.set(newLocale);
  if (typeof window !== 'undefined') {
    localStorage.setItem('mazeeda_language', newLocale);
  }
}
