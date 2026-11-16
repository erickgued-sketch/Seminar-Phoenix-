// Content QA: every published level must pass the same gate that generated levels go through.
import { describe, expect, it } from 'vitest';
import { authored, blueprint, chapters, path, totalLevels } from '@/content/curriculum';
import { practices } from '@/content/practices';
import { longestSharedRun, TOTAL_PAGES, validateLevel } from '@/lib/validateLevel';

describe('authored levels', () => {
  it('has 15–20 hand-authored levels', () => {
    expect(authored.length).toBeGreaterThanOrEqual(15);
    expect(authored.length).toBeLessThanOrEqual(20);
  });
  it.each(authored.map((l) => [l.id, l] as const))('%s passes validation', (_id, level) => {
    expect(validateLevel(level)).toEqual([]);
  });
  it('never repeats a title or a principle', () => {
    expect(new Set(authored.map((l) => l.title.es)).size).toBe(authored.length);
    expect(new Set(authored.map((l) => l.principle.es)).size).toBe(authored.length);
  });
  it('places the correct answer in varied positions overall', () => {
    const idx = authored.flatMap((l) => l.exercises.flatMap((e) => ('answer' in e ? [e.answer] : [])));
    expect(new Set(idx).size).toBeGreaterThan(1);
  });
});

describe('program map', () => {
  it('offers 100+ levels, numbered sequentially with unique ids', () => {
    expect(totalLevels).toBeGreaterThanOrEqual(100);
    expect(path.map((p) => p.n)).toEqual(path.map((_, i) => i + 1));
    expect(new Set(path.map((p) => p.id)).size).toBe(path.length);
  });
  it('keeps chapters in order and every chapter populated', () => {
    const seq = path.map((p) => p.chapter);
    expect([...seq].sort((a, b) => a - b)).toEqual(seq);
    for (const c of chapters) expect(path.some((p) => p.chapter === c.n)).toBe(true);
  });
  it('ties every blueprint level to real source pages and a bilingual principle', () => {
    for (const b of blueprint) {
      expect(b.pages.length).toBeGreaterThan(0);
      expect(b.pages.every((p) => p >= 1 && p <= TOTAL_PAGES)).toBe(true);
      expect(b.principle.es.length).toBeGreaterThan(20);
      expect(b.principle.en.length).toBeGreaterThan(20);
    }
  });
  it('covers the transcript broadly (no long unmapped stretches)', () => {
    const covered = new Set(path.flatMap((p) => (p.kind === 'level' ? p.level.pages : p.bp.pages)));
    expect(covered.size / TOTAL_PAGES).toBeGreaterThan(0.85);
  });
});

describe('practices', () => {
  it('are bilingual, sourced or labelled as complements, and usable', () => {
    for (const p of practices) {
      expect(p.title.es && p.title.en && p.what.es && p.what.en).toBeTruthy();
      if (p.origin === 'seminar') expect(p.pages.length).toBeGreaterThan(0);
      else expect(p.note).toBeTruthy();
      if (p.mode === 'timer') expect(p.timerSeconds).toBeGreaterThan(0);
      if (p.mode === 'text') expect(p.prompts!.length).toBeGreaterThan(0);
    }
  });
  it('includes the practices the product promises', () => {
    for (const id of ['gratitude', 'meditation', 'affirmations', 'visualization', 'worry', 'seven', 'silence', 'forgive']) expect(practices.some((p) => p.id === id)).toBe(true);
  });
});

describe('validator (gate for generated content)', () => {
  const good = authored[0];
  it('rejects levels with missing translations, bad answers or no source', () => {
    const bad = { ...good, pages: [], cards: good.cards.slice(0, 2), exercises: [{ ...good.exercises[0], answer: 9 }] } as typeof good;
    const errs = validateLevel(bad);
    expect(errs.some((e) => e.startsWith('pages'))).toBe(true);
    expect(errs.some((e) => e.startsWith('cards'))).toBe(true);
    expect(errs.some((e) => e.includes('answer index'))).toBe(true);
    expect(errs.some((e) => e.startsWith('exercises: needs'))).toBe(true);
  });
  it('detects verbatim copying from the source', () => {
    const src = 'uno se siente bien consigo mismo positivo de sí mismo hasta el grado en que se siente que está en control de su propia vida';
    expect(longestSharedRun('Dice que uno se siente bien consigo mismo positivo de sí mismo hasta el grado en que manda', src)).toBeGreaterThan(10);
    const copied = { ...good, cards: [{ ...good.cards[0], body: { es: src, en: 'x' } }, ...good.cards.slice(1)] };
    expect(validateLevel(copied, { sourceText: src }).some((e) => e.startsWith('copy check'))).toBe(true);
    expect(validateLevel(good, { sourceText: src })).toEqual([]);
  });
});
