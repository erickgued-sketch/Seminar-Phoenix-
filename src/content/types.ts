export type Lang = 'es' | 'en';
export type L = { es: string; en: string };

export type Card = { title: L; body: L; example: L };

export type Exercise =
  | { type: 'mc' | 'scenario' | 'fill'; q: L; options: L[]; answer: number; why: L }
  | { type: 'order'; q: L; tokens: { es: string[]; en: string[] }; why: L }
  | { type: 'match'; q: L; pairs: { a: L; b: L }[]; why: L };

/** One principle = one level. Seven components: learn, reinforce, reflect, apply, personalize, prove, review-later. */
export type Level = {
  id: string;
  chapter: number;
  title: L;
  /** One-line "remember this" summary said by Rai. */
  principle: L;
  /** Source pages in the Seminario Fénix transcript (internal traceability). */
  pages: number[];
  /** True when the source claim is historical/metaphysical/health-related and not established science. */
  caveat?: L;
  cards: Card[];
  exercises: Exercise[];
  reflect: L;
  apply: L;
  applyMinutes: number;
  prove: L;
};

/** Curriculum entry that is mapped to the source but whose full lesson has not been authored/validated yet. */
export type Blueprint = {
  id: string;
  chapter: number;
  title: L;
  principle: L;
  pages: number[];
  caveat: boolean;
};

export type Chapter = { n: number; title: L; subtitle: L; art: string };

export type Practice = {
  id: string;
  icon: string;
  title: L;
  minutes: number;
  what: L;
  /** How it relates to the source. 'seminar' = taught in the transcript; 'complement' = app addition, labelled as such. */
  origin: 'seminar' | 'complement';
  pages: number[];
  note?: L;
  steps: L[];
  /** Kind of interactive UI the practice uses. */
  mode: 'list' | 'text' | 'timer' | 'steps' | 'affirm';
  prompts?: L[];
  listTarget?: number;
  timerSeconds?: number;
};
