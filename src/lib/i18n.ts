import type { L, Lang } from '@/content/types';
import { useStore } from './store';

/** `const t = useT(); t('Hola', 'Hello')` — Spanish first, it is the product's base language. */
export function useT() {
  const lang = useStore((s) => s.profile.lang);
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
