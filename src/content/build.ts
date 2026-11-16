// Compact authoring helpers so lesson files stay readable.
import type { Card, Exercise, L, Level } from './types';

type P = [string, string]; // [es, en]
const l = (p: P): L => ({ es: p[0], en: p[1] });

export const card = (title: P, body: P, example: P): Card => ({ title: l(title), body: l(body), example: l(example) });

const choice =
  (type: 'mc' | 'scenario' | 'fill') =>
  (q: P, options: P[], answer: number, why: P): Exercise => ({ type, q: l(q), options: options.map(l), answer, why: l(why) });

export const mc = choice('mc');
export const scenario = choice('scenario');
/** Question text must contain ___ where the missing word goes. */
export const fill = choice('fill');

/** Sentence given in the correct order; the player shuffles the tiles. */
export const order = (q: P, es: string, en: string, why: P): Exercise => ({
  type: 'order',
  q: l(q),
  tokens: { es: es.split(' '), en: en.split(' ') },
  why: l(why),
});

export const match = (q: P, pairs: [P, P][], why: P): Exercise => ({
  type: 'match',
  q: l(q),
  pairs: pairs.map(([a, b]) => ({ a: l(a), b: l(b) })),
  why: l(why),
});

export const level = (
  id: string,
  chapter: number,
  pages: number[],
  title: P,
  principle: P,
  cards: Card[],
  exercises: Exercise[],
  reflect: P,
  apply: P,
  applyMinutes: number,
  prove: P,
  caveat?: P,
): Level => ({
  id,
  chapter,
  pages,
  title: l(title),
  principle: l(principle),
  cards,
  exercises,
  reflect: l(reflect),
  apply: l(apply),
  applyMinutes,
  prove: l(prove),
  ...(caveat ? { caveat: l(caveat) } : {}),
});
