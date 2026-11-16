// Local-calendar date helpers. Dates are stored as 'YYYY-MM-DD' in the user's timezone.
export const iso = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const today = (): string => iso(new Date());
export const parse = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (s: string, n: number): string => {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};
export const diffDays = (a: string, b: string): number => Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000);
/** Monday of the week containing `s`. */
export const weekStart = (s: string): string => addDays(s, -((parse(s).getDay() + 6) % 7));
export const lastNDays = (s: string, n: number): string[] => Array.from({ length: n }, (_, i) => addDays(s, -i));
