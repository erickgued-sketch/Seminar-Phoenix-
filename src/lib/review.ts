// Weekly CEO Review: computed only from recorded data — nothing is inferred or invented.
import { authored } from '@/content/curriculum';
import { addDays, weekStart } from './dates';
import type { State } from './store';

export type Review = {
  from: string;
  to: string;
  levels: string[];
  evidence: number;
  habitRows: { name: string; hits: number; target: number }[];
  prioritiesDone: number;
  prioritiesSet: number;
  postponed: string[];
  wins: string[];
  lessons: string[];
  obstacles: string[];
  practices: number;
  goal?: { title: string; progress: number; nextWeek?: string };
  nextFocus: 'apply' | 'habits' | 'reflect' | 'goal' | 'learn' | 'keep';
};

export function buildReview(s: Pick<State, 'progress' | 'habits' | 'days' | 'goals'>, day: string, offsetWeeks = 0): Review {
  const from = addDays(weekStart(day), -7 * offsetWeeks);
  const days = Array.from({ length: 7 }, (_, i) => addDays(from, i));
  const logs = days.map((d) => s.days[d]).filter(Boolean);
  const levels = authored.filter((l) => days.includes(s.progress[l.id]?.completedAt ?? '')).map((l) => l.id);
  const evidence = Object.values(s.progress).filter((p) => p.evidence && days.includes(p.evidence.at)).length;
  const habitRows = s.habits.filter((h) => !h.archived).map((h) => ({ name: h.name, target: h.perWeek, hits: logs.filter((l) => l.habits.includes(h.id)).length }));
  const primes = logs.map((l) => l.prime).filter((p): p is NonNullable<typeof p> => !!p);
  const goal = s.goals.find((g) => g.active);
  const habitRate = habitRows.length ? habitRows.reduce((n, r) => n + Math.min(1, r.hits / r.target), 0) / habitRows.length : 1;
  const pendingEvidence = Object.values(s.progress).filter((p) => !p.evidence).length;
  const reflections = logs.filter((l) => l.evening).length;
  const nextFocus: Review['nextFocus'] = !goal ? 'goal' : pendingEvidence > 1 ? 'apply' : habitRate < 0.6 ? 'habits' : reflections < 3 ? 'reflect' : levels.length < 3 ? 'learn' : 'keep';
  return {
    from, to: days[6], levels, evidence, habitRows,
    prioritiesSet: primes.reduce((n, p) => n + p.priorities.filter(Boolean).length, 0),
    prioritiesDone: primes.reduce((n, p) => n + p.done.filter(Boolean).length, 0),
    postponed: primes.flatMap((p) => p.priorities.filter((t, i) => t && !p.done[i])).slice(-5),
    wins: logs.map((l) => l.evening?.won).filter((v): v is string => !!v),
    lessons: logs.map((l) => l.evening?.learned).filter((v): v is string => !!v),
    obstacles: logs.map((l) => l.evening?.off).filter((v): v is string => !!v),
    practices: logs.reduce((n, l) => n + l.practices.length, 0),
    goal: goal && { title: goal.title, progress: goal.progress, nextWeek: goal.weeks.find((w) => !w.done)?.focus },
    nextFocus,
  };
}
