import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
  const defaultTheme = 'light';
  
  // Ambil tema dari localStorage jika ada, kalau tidak gunakan default
  const initialValue = browser 
    ? (window.localStorage.getItem('mazeeda_theme') as Theme) || defaultTheme
    : defaultTheme;

  const { subscribe, set, update } = writable<Theme>(initialValue);

  return {
    subscribe,
    set: (value: Theme) => {
      if (browser) {
        window.localStorage.setItem('mazeeda_theme', value);
        if (value === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      set(value);
    },
    toggle: () => update((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      if (browser) {
        window.localStorage.setItem('mazeeda_theme', next);
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return next;
    }),
    init: () => {
      if (browser) {
        const current = window.localStorage.getItem('mazeeda_theme') as Theme || defaultTheme;
        if (current === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
  };
}

export const themeStore = createThemeStore();
