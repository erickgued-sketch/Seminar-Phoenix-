// Knowledge base for retrieval. Every chunk is ORIGINAL paraphrase with page references
// into the Seminario Fénix transcript — the transcript itself is never bundled in the app.
import { authored, blueprint, chapterOf } from '@/content/curriculum';
import { practices } from '@/content/practices';
import type { L } from '@/content/types';

export type Chunk = {
  id: string;
  kind: 'seminar' | 'practice' | 'vault';
  title: L;
  text: L;
  pages: number[];
  chapter?: number;
  action?: L;
  question?: L;
  caveat?: L;
};

const genericCaveat: L = {
  es: 'El seminario lo presenta como principio; no es una afirmación científica comprobada.',
  en: 'The seminar presents this as a principle; it is not an established scientific claim.',
};

export const seminarChunks: Chunk[] = [
  ...authored.map((lv): Chunk => ({
    id: lv.id,
    kind: 'seminar',
    title: lv.title,
    text: {
      es: [lv.principle.es, ...lv.cards.map((c) => `${c.title.es}. ${c.body.es}`), chapterOf(lv.chapter).title.es].join(' '),
      en: [lv.principle.en, ...lv.cards.map((c) => `${c.title.en}. ${c.body.en}`), chapterOf(lv.chapter).title.en].join(' '),
    },
    pages: lv.pages,
    chapter: lv.chapter,
    action: lv.apply,
    question: lv.reflect,
    caveat: lv.caveat,
  })),
  ...blueprint.map((b): Chunk => ({
    id: b.id,
    kind: 'seminar',
    title: b.title,
    text: { es: `${b.title.es}. ${b.principle.es} ${chapterOf(b.chapter).title.es}`, en: `${b.title.en}. ${b.principle.en} ${chapterOf(b.chapter).title.en}` },
    pages: b.pages,
    chapter: b.chapter,
    caveat: b.caveat ? genericCaveat : undefined,
  })),
  ...practices.filter((p) => p.origin === 'seminar').map((p): Chunk => ({
    id: `p-${p.id}`,
    kind: 'practice',
    title: p.title,
    text: { es: `${p.title.es}. ${p.what.es} ${p.steps.map((s) => s.es).join(' ')}`, en: `${p.title.en}. ${p.what.en} ${p.steps.map((s) => s.en).join(' ')}` },
    pages: p.pages,
    action: { es: `Abre Mente → «${p.title.es}» (${p.minutes} min) y complétala ahora.`, en: `Open Mind → "${p.title.en}" (${p.minutes} min) and complete it now.` },
    caveat: p.note,
  })),
];
