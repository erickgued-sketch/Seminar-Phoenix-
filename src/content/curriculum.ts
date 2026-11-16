// The Fénix program: 12 chapters, 117 levels, each tied to the source transcript pages it paraphrases.
// Every level is fully authored and passes `validateLevel` (see tests/content.test.ts).
import { part1 } from './levels/part1';
import { ch04 } from './levels/ch04';
import { ch05 } from './levels/ch05';
import { ch06 } from './levels/ch06';
import { ch07 } from './levels/ch07';
import { ch08 } from './levels/ch08';
import { ch09 } from './levels/ch09';
import { ch10 } from './levels/ch10';
import { ch11 } from './levels/ch11';
import { ch12 } from './levels/ch12';
import { part2 } from './levels/part2';
import type { Blueprint, Chapter, Level } from './types';

export const chapters: Chapter[] = [
  { n: 1, art: 'c01', title: { es: 'Los siete ingredientes del éxito', en: 'The seven ingredients of success' }, subtitle: { es: 'Qué significa de verdad tener éxito', en: 'What success really means' } },
  { n: 2, art: 'c02', title: { es: 'Las leyes mentales', en: 'The mental laws' }, subtitle: { es: 'Cómo tus ideas dirigen tus resultados', en: 'How your ideas drive your results' } },
  { n: 3, art: 'c03', title: { es: 'Autoconcepto y mente', en: 'Self-concept and mind' }, subtitle: { es: 'La idea que tienes de ti', en: 'The idea you hold of yourself' } },
  { n: 4, art: 'c04', title: { es: 'Responsabilidad y emociones', en: 'Responsibility and emotions' }, subtitle: { es: 'Soltar la culpa, el enojo y la queja', en: 'Letting go of blame, anger and complaint' } },
  { n: 5, art: 'c05', title: { es: 'Preocupación, cambio y hábitos', en: 'Worry, change and habits' }, subtitle: { es: 'Paz mental y nuevos patrones', en: 'Peace of mind and new patterns' } },
  { n: 6, art: 'c06', title: { es: 'Programar la mente', en: 'Programming the mind' }, subtitle: { es: 'Visualización, afirmaciones y dieta mental', en: 'Visualization, affirmations and mental diet' } },
  { n: 7, art: 'c07', title: { es: 'Aprender y relajarse', en: 'Learning and relaxing' }, subtitle: { es: 'Aprender a aprender y calmar la mente', en: 'Learning to learn and calming the mind' } },
  { n: 8, art: 'c08', title: { es: 'Metas: la habilidad maestra', en: 'Goals: the master skill' }, subtitle: { es: 'De deseos vagos a un plan escrito', en: 'From vague wishes to a written plan' } },
  { n: 9, art: 'c09', title: { es: 'Tiempo y ejecución', en: 'Time and execution' }, subtitle: { es: 'Prioridades, foco y «hazlo ahora»', en: 'Priorities, focus and "do it now"' } },
  { n: 10, art: 'c10', title: { es: 'Creatividad e intuición', en: 'Creativity and intuition' }, subtitle: { es: 'Silencio, ideas y solución de problemas', en: 'Silence, ideas and problem solving' } },
  { n: 11, art: 'c11', title: { es: 'Salud, energía y estrés', en: 'Health, energy and stress' }, subtitle: { es: 'Cuidar el cuerpo y cerrar pendientes', en: 'Caring for the body and closing loops' } },
  { n: 12, art: 'c12', title: { es: 'Relaciones, familia y propósito', en: 'Relationships, family and purpose' }, subtitle: { es: 'Hacer sentir importantes a los demás', en: 'Making others feel important' } },
];

type Row = [number, string, 0 | 1, string, string, string, string];
// [chapter, pages "a-b,c", caveat, title es, title en, principle es, principle en]
// Blueprint rows for chapters that are mapped to the source but not authored yet. Empty today:
// all twelve chapters are written. New chapters start here and move out once their lessons pass validation.
const rows: Row[] = [];

const parsePages = (s: string): number[] => {
  const out: number[] = [];
  for (const part of s.split(',')) {
    const [a, b] = part.split('-').map(Number);
    for (let p = a; p <= (b ?? a); p++) out.push(p);
  }
  return out;
};

export const authored: Level[] = [...part1, ...part2, ...ch04, ...ch05, ...ch06, ...ch07, ...ch08, ...ch09, ...ch10, ...ch11, ...ch12];

// A chapter leaves the blueprint as soon as its lessons are authored.
const authoredChapters = new Set(authored.map((l) => l.chapter));
const pending = rows.filter((r) => !authoredChapters.has(r[0]));

export const blueprint: Blueprint[] = pending.map((r, i) => ({
  id: `b${String(i + authored.length + 1).padStart(3, '0')}`,
  chapter: r[0],
  pages: parsePages(r[1]),
  caveat: r[2] === 1,
  title: { es: r[3], en: r[4] },
  principle: { es: r[5], en: r[6] },
}));

export type PathNode =
  | { kind: 'level'; n: number; id: string; chapter: number; level: Level }
  | { kind: 'blueprint'; n: number; id: string; chapter: number; bp: Blueprint };

/** The full ordered path shown on the Journey map. */
export const path: PathNode[] = [
  ...authored.map((level, i): PathNode => ({ kind: 'level', n: i + 1, id: level.id, chapter: level.chapter, level })),
  ...blueprint.map((bp, i): PathNode => ({ kind: 'blueprint', n: authored.length + i + 1, id: bp.id, chapter: bp.chapter, bp })),
];

export const totalLevels = path.length;
export const levelById = (id: string): Level | undefined => authored.find((l) => l.id === id);
export const chapterOf = (n: number): Chapter => chapters.find((c) => c.n === n) ?? chapters[0];
