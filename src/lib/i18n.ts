import type { L, Lang } from '@/content/types';
import { useStore } from './store';

/** `const t = useT(); t('Hola', 'Hello')` — Spanish first, it is the product's base language. */
/** Subscribes the caller to appearance changes so inline `colors.*` values are re-read. */
export function useScheme() {
  return useStore((s) => s.scheme);
}

export function useT() {
  const lang = useStore((s) => s.profile.lang);
  useScheme(); // every screen calls useT, so every screen repaints when the appearance changes
  return (es: string, en: string) => (lang === 'en' ? en : es);
}
export function useLang(): Lang {
  return useStore((s) => s.profile.lang);
}
export const pick = (l: L, lang: Lang) => l[lang];
export const formatDate = (isoDate: string, lang: Lang) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
};
