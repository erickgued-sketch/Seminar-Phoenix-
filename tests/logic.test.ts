import { describe, expect, it } from 'vitest';
import { composeReply } from '@/lib/coach/compose';
import { MIN_SCORE, search, tokenize } from '@/lib/coach/retrieval';
import { addDays, diffDays, weekStart } from '@/lib/dates';
import { scenarios } from '@/lib/future';
import { buildWeeks, draftIssues, toGoal } from '@/lib/goalPlan';
import { dueReviews, isUnlocked, nextLevel, pendingEvidence } from '@/lib/progress';
import { buildReview } from '@/lib/review';
import { computeScore } from '@/lib/score';
import { advance, GRADUATED, initial, INTERVALS, isDue } from '@/lib/srs';
import { initialState, nextStreak, type State } from '@/lib/store';

const D = '2026-11-16'; // a Monday
const base = (): State => ({ ...initialState(), hydrated: true });
const lp = (completedAt: string, extra = {}) => ({ completedAt, score: 100, reflection: '', commit: '', srsStage: 0, nextReview: addDays(completedAt, 1), ...extra });

describe('dates', () => {
  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(diffDays('2026-02-27', '2026-03-01')).toBe(2);
    expect(weekStart('2026-11-22')).toBe('2026-11-16');
  });
});

describe('spaced review (1, 3, 7, 14, 30 days)', () => {
  it('schedules the first review for the next day', () => {
    expect(initial(D)).toEqual({ srsStage: 0, nextReview: addDays(D, 1) });
  });
  it('walks the whole ladder and graduates', () => {
    let s = initial(D);
    const gaps: number[] = [];
    for (let i = 0; i < GRADUATED; i++) {
      s = advance(s, true, D);
      if (s.nextReview) gaps.push(diffDays(D, s.nextReview));
    }
    expect(gaps).toEqual(INTERVALS.slice(1));
    expect(s).toEqual({ srsStage: GRADUATED, nextReview: null });
    expect(isDue(s, addDays(D, 999))).toBe(false);
  });
  it('steps back on a miss but never below the first interval', () => {
    expect(advance({ srsStage: 3, nextReview: D }, false, D)).toEqual({ srsStage: 2, nextReview: addDays(D, 7) });
    expect(advance({ srsStage: 0, nextReview: D }, false, D).srsStage).toBe(0);
  });
});

describe('streak', () => {
  const s0 = { current: 3, longest: 5, lastActive: D, freezes: 2 };
  it('is idempotent within a day and grows on consecutive days', () => {
    expect(nextStreak(s0, D)).toBe(s0);
    expect(nextStreak(s0, addDays(D, 1)).current).toBe(4);
  });
  it('bridges one missed day with a freeze instead of resetting', () => {
    expect(nextStreak(s0, addDays(D, 2))).toMatchObject({ current: 4, freezes: 1 });
  });
  it('restarts at 1 after a longer gap or with no freezes, keeping the record', () => {
    expect(nextStreak(s0, addDays(D, 3))).toMatchObject({ current: 1, longest: 5 });
    expect(nextStreak({ ...s0, freezes: 0 }, addDays(D, 2)).current).toBe(1);
  });
});

describe('progress and unlocking', () => {
  it('unlocks strictly in order', () => {
    const s = base();
    expect(isUnlocked(s, 'l01')).toBe(true);
    expect(isUnlocked(s, 'l02')).toBe(false);
    s.progress.l01 = lp(D);
    expect(isUnlocked(s, 'l02')).toBe(true);
    expect(isUnlocked(s, 'l03')).toBe(false);
    expect(nextLevel(s)?.id).toBe('l02');
  });
  it('tracks pending evidence and due reviews', () => {
    const s = base();
    s.progress.l01 = lp(addDays(D, -1));
    s.progress.l02 = lp(D, { evidence: { text: 'x', at: D } });
    expect(pendingEvidence(s).map((l) => l.id)).toEqual(['l01']);
    expect(dueReviews(s, D).map((l) => l.id)).toEqual(['l01']);
  });
});

describe('NEXTME Score', () => {
  it('is 0 for a brand-new user and its parts always sum to the total (max 100)', () => {
    const z = computeScore(base(), D);
    expect(z.total).toBe(0);
    expect(z.parts.reduce((n, p) => n + p.max, 0)).toBe(100);
  });
  it('rewards application more than learning alone', () => {
    const learn = base();
    learn.progress.l01 = lp(D);
    const apply = base();
    apply.progress.l01 = lp(D, { evidence: { text: 'did it', at: D } });
    expect(computeScore(apply, D).total - computeScore(learn, D).total).toBe(25);
  });
  it('reaches 100 with a clear goal, learning, evidence, habits, reflection and streak', () => {
    const s = base();
    s.goals = [toGoal({ title: 'Hablar inglés fluido', why: 'carrera', metric: '3 charlas', days: 90, obstacles: '', dailyAction: '15 min', identity: '' }, 'es')];
    s.habits = [{ id: 'h', name: 'x', area: 'a', perWeek: 5, createdAt: D }];
    for (let i = 0; i < 5; i++) {
      const d = addDays(D, -i);
      s.progress[`l0${i + 1}`] = lp(d, { evidence: { text: 'e', at: d } });
      s.days[d] = { habits: ['h'], practices: [], evening: { won: 'a', learned: '', off: '', tomorrow: '' } };
    }
    s.streak = { current: 7, longest: 7, lastActive: D, freezes: 2 };
    expect(computeScore(s, D).total).toBe(100);
  });
});

describe('goal architect', () => {
  it('flags a goal with no number, reason or daily action', () => {
    expect(draftIssues({ title: 'Ser mejor', why: '', metric: 'mejorar', days: 90, obstacles: '', dailyAction: '', identity: '' }, 'es')).toHaveLength(3);
    expect(draftIssues({ title: 'Hablar inglés', why: 'x', metric: '3 charlas', days: 90, obstacles: '', dailyAction: '15 min', identity: '' }, 'es')).toEqual([]);
  });
  it('builds one editable milestone per week in three phases', () => {
    const w = buildWeeks(90, 'es');
    expect(w).toHaveLength(13);
    expect(w[0].focus).toMatch(/^Fundamento/);
    expect(w[12].focus).toMatch(/^Consolidación/);
    expect(buildWeeks(30, 'en')[0].focus).toMatch(/^Foundation/);
  });
});

describe('weekly review uses only recorded data', () => {
  it('reports postponed priorities and recommends applying when evidence is missing', () => {
    const s = base();
    s.goals = [toGoal({ title: 'Meta de prueba', why: 'x', metric: '1', days: 90, obstacles: '', dailyAction: 'a', identity: '' }, 'es')];
    s.progress.l01 = lp(D);
    s.progress.l02 = lp(D);
    s.days[D] = { habits: [], practices: ['gratitude'], prime: { priorities: ['A', 'B', ''], done: [true, false, false] }, evening: { won: 'gané', learned: '', off: 'cansancio', tomorrow: '' } };
    const r = buildReview(s, D);
    expect(r).toMatchObject({ levels: ['l01', 'l02'], prioritiesSet: 2, prioritiesDone: 1, postponed: ['B'], wins: ['gané'], obstacles: ['cansancio'], practices: 1, nextFocus: 'apply' });
  });
  it('asks for a goal first when none exists', () => {
    expect(buildReview(base(), D).nextFocus).toBe('goal');
  });
});

describe('future self is plain arithmetic', () => {
  it('multiplies weekly frequency, nothing more', () => {
    const [cur, steady, stretch] = scenarios(2, 5, 30);
    expect(cur.reps365).toBe(104);
    expect(steady).toMatchObject({ reps365: 260, hours365: 130 });
    expect(stretch.perWeek).toBe(7);
  });
});

describe('coach retrieval and grounding', () => {
  const ctx = () => ({ ...base(), profile: { ...base().profile, lang: 'es' as const } });
  it('normalises accents and drops stop words', () => {
    expect(tokenize('¿Qué es la visualización?')).toEqual(['visualiz']);
  });
  it.each([
    ['Estoy preocupado y no dejo de darle vueltas', /preocupa/i],
    ['¿Cómo escribo una meta?', /meta|escr/i],
    ['Tengo miedo al rechazo', /miedo|temes|rechaz/i],
    ['quiero perdonar a alguien', /perd/i],
  ])('finds a relevant principle for "%s"', (q, re) => {
    const hits = search(q, 'es');
    expect(hits[0].score).toBeGreaterThan(MIN_SCORE);
    expect(hits.slice(0, 3).some((h) => re.test(`${h.chunk.title.es} ${h.chunk.text.es}`))).toBe(true);
  });
  it('works in English too', () => {
    expect(search('I keep worrying about everything', 'en')[0].chunk.text.en).toMatch(/worr/i);
  });
  it('cites the seminar pages and always ends with an action and a question', () => {
    const r = composeReply('¿Cómo mejoro mi disciplina?', ctx());
    expect(r.source.kind).not.toBe('none');
    expect(r.source.pages.length).toBeGreaterThan(0);
    expect(r.action.length).toBeGreaterThan(10);
    expect(r.question).toMatch(/\?/);
  });
  it('admits when it has no grounding instead of inventing', () => {
    const r = composeReply('capital de Mongolia', ctx());
    expect(r.source.kind).toBe('none');
    expect(r.insight).toMatch(/no encontré/i);
  });
  it('prefers the user vault when it matches and labels it', () => {
    const c = ctx();
    c.vault = [{ id: 'v1', title: 'Mis notas', text: 'La técnica pomodoro divide el trabajo en bloques de veinticinco minutos con descansos cortos entre bloques.', addedAt: D }];
    expect(composeReply('técnica pomodoro bloques', c).source).toMatchObject({ kind: 'vault', title: 'Mis notas' });
  });
  it('does not use goals for personalisation without consent', () => {
    const c = ctx();
    c.goals = [toGoal({ title: 'META-SECRETA', why: 'x', metric: '1', days: 90, obstacles: '', dailyAction: 'a', identity: '' }, 'es')];
    c.profile.memoryConsent = false;
    const r = composeReply('¿Cómo mejoro mi disciplina?', c);
    expect(JSON.stringify(r)).not.toContain('META-SECRETA');
    expect(r.dataNote).toBeUndefined();
  });
  it('routes crisis language to human help, not coaching', () => {
    const r = composeReply('a veces pienso en quitarme la vida', ctx());
    expect(r.safety).toBe(true);
    expect(r.action).toMatch(/emergencia|crisis/i);
  });
});
