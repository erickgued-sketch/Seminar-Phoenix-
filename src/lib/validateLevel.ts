// Gate for generated lessons. Nothing produced by the content engine is published
// to the map unless it passes these checks.
import type { Exercise, L, Level } from '../content/types'; // relative on purpose: also imported by the Edge Function

export const TOTAL_PAGES = 211;
const ok = (l: unknown): l is L =>
  !!l && typeof (l as L).es === 'string' && typeof (l as L).en === 'string' && (l as L).es.trim().length > 0 && (l as L).en.trim().length > 0;

const words = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ\s]/g, ' ').split(/\s+/).filter(Boolean);

/** Longest run of consecutive words that `text` shares with `source`. Used to block verbatim copying. */
export function longestSharedRun(text: string, source: string): number {
  const a = words(text);
  const b = words(source);
  if (!a.length || !b.length) return 0;
  const pos = new Map<string, number[]>();
  b.forEach((w, i) => (pos.get(w) ?? pos.set(w, []).get(w)!).push(i));
  let best = 0;
  let prev = new Map<number, number>();
  for (const w of a) {
    const cur = new Map<number, number>();
    for (const j of pos.get(w) ?? []) {
      const run = (prev.get(j - 1) ?? 0) + 1;
      cur.set(j, run);
      if (run > best) best = run;
    }
    prev = cur;
  }
  return best;
}

function checkExercise(e: Exercise, i: number, errs: string[]) {
  const at = `exercises[${i}]`;
  if (!ok(e.q)) errs.push(`${at}: question missing a language`);
  if (!ok(e.why)) errs.push(`${at}: explanation ("why") is required in both languages`);
  if (e.type === 'mc' || e.type === 'scenario' || e.type === 'fill') {
    if (e.options.length < 2 || e.options.length > 4) errs.push(`${at}: needs 2–4 options`);
    if (!e.options.every(ok)) errs.push(`${at}: option missing a language`);
    if (!Number.isInteger(e.answer) || e.answer < 0 || e.answer >= e.options.length) errs.push(`${at}: answer index out of range`);
    if (e.type === 'fill' && !(e.q.es.includes('___') && e.q.en.includes('___'))) errs.push(`${at}: fill question needs ___ in both languages`);
    for (const lang of ['es', 'en'] as const) {
      const set = new Set(e.options.map((o) => o[lang].trim().toLowerCase()));
      if (set.size !== e.options.length) errs.push(`${at}: duplicate options (${lang})`);
    }
  } else if (e.type === 'order') {
    if (e.tokens.es.length < 3 || e.tokens.en.length < 3) errs.push(`${at}: order needs at least 3 tiles per language`);
    if (e.tokens.es.length > 12 || e.tokens.en.length > 12) errs.push(`${at}: order has too many tiles`);
  } else if (e.type === 'match') {
    if (e.pairs.length < 2 || e.pairs.length > 4) errs.push(`${at}: match needs 2–4 pairs`);
    if (!e.pairs.every((p) => ok(p.a) && ok(p.b))) errs.push(`${at}: pair missing a language`);
  } else errs.push(`${at}: unknown type`);
}

export function validateLevel(lv: Level, opts: { sourceText?: string; maxSharedWords?: number } = {}): string[] {
  const errs: string[] = [];
  if (!lv.id) errs.push('id missing');
  for (const k of ['title', 'principle', 'reflect', 'apply', 'prove'] as const) if (!ok(lv[k])) errs.push(`${k}: both languages required`);
  if (!lv.pages?.length) errs.push('pages: every level must cite its source pages');
  else if (lv.pages.some((p) => !Number.isInteger(p) || p < 1 || p > TOTAL_PAGES)) errs.push('pages: out of range');
  if (lv.cards.length < 3 || lv.cards.length > 5) errs.push('cards: needs 3–5 cards');
  lv.cards.forEach((c, i) => {
    if (!ok(c.title) || !ok(c.body) || !ok(c.example)) errs.push(`cards[${i}]: title, body and example required in both languages`);
    else if (c.body.es.length > 320 || c.body.en.length > 320) errs.push(`cards[${i}]: body too long — one idea per card`);
  });
  if (lv.exercises.length < 4 || lv.exercises.length > 6) errs.push('exercises: needs 4–6 exercises');
  lv.exercises.forEach((e, i) => checkExercise(e, i, errs));
  if (new Set(lv.exercises.map((e) => e.type)).size < 3) errs.push('exercises: use at least 3 different exercise types');
  if (!(lv.applyMinutes >= 1 && lv.applyMinutes <= 5)) errs.push('applyMinutes: the action must take 1–5 minutes');
  if (opts.sourceText) {
    const limit = opts.maxSharedWords ?? 10;
    const text = [lv.principle.es, ...lv.cards.flatMap((c) => [c.body.es, c.example.es])].join(' . ');
    const run = longestSharedRun(text, opts.sourceText);
    if (run > limit) errs.push(`copy check: ${run} consecutive words match the source (limit ${limit}) — paraphrase`);
  }
  return errs;
}
