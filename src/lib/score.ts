// NEXTME Score (0–100). A transparent activity index over the last 7 days — it measures
// what you practised, not your worth, intelligence or mental health.
import { authored } from '@/content/curriculum';
import type { L } from '@/content/types';
import { lastNDays } from './dates';
import type { State } from './store';

export type ScorePart = { key: string; label: L; value: number; max: number; hint: L };
type Input = Pick<State, 'goals' | 'progress' | 'habits' | 'days' | 'streak'>;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function computeScore(s: Input, day: string): { total: number; parts: ScorePart[]; rank: L } {
  const week = lastNDays(day, 7);
  const goal = s.goals.find((g) => g.active);
  const clarity = goal ? [goal.title, goal.why, goal.metric, goal.deadline, goal.dailyAction].filter((v) => v && v.trim()).length / 5 : 0;

  const done = Object.values(s.progress);
  const learnedThisWeek = done.filter((p) => week.includes(p.completedAt)).length;
  const learning = clamp01(learnedThisWeek / 5);

  const applied = done.length ? done.filter((p) => p.evidence).length / done.length : 0;

  const habits = s.habits.filter((h) => !h.archived);
  const target = habits.reduce((n, h) => n + h.perWeek, 0);
  const hits = week.reduce((n, d) => n + (s.days[d]?.habits.filter((id) => habits.some((h) => h.id === id)).length ?? 0), 0);
  const consistency = target ? clamp01(hits / target) : 0;

  const reflection = clamp01(week.filter((d) => s.days[d]?.evening || s.days[d]?.practices.length).length / 5);
  const streak = clamp01(s.streak.current / 7);

  const mk = (key: string, es: string, en: string, ratio: number, max: number, hes: string, hen: string): ScorePart => ({
    key, label: { es, en }, value: Math.round(ratio * max), max, hint: { es: hes, en: hen },
  });
  const parts = [
    mk('clarity', 'Claridad de meta', 'Goal clarity', clarity, 15, 'Meta activa con porqué, indicador, fecha y acción diaria.', 'Active goal with a why, a metric, a date and a daily action.'),
    mk('learning', 'Aprendizaje', 'Learning', learning, 15, 'Niveles completados en 7 días (5 = máximo).', 'Levels completed in 7 days (5 = max).'),
    mk('application', 'Aplicación', 'Application', applied, 25, 'Porcentaje de niveles con evidencia de aplicación registrada.', 'Share of levels with recorded evidence of application.'),
    mk('habits', 'Hábitos', 'Habits', consistency, 20, 'Marcas de hábito en 7 días frente a tu objetivo semanal.', 'Habit check-ins in 7 days versus your weekly target.'),
    mk('reflection', 'Reflexión', 'Reflection', reflection, 15, 'Días con reflexión nocturna o práctica de Mind Studio (5 = máximo).', 'Days with an evening reflection or a Mind Studio practice (5 = max).'),
    mk('streak', 'Constancia', 'Consistency', streak, 10, 'Racha actual (7 días = máximo).', 'Current streak (7 days = max).'),
  ];
  const total = parts.reduce((n, p) => n + p.value, 0);
  return { total, parts, rank: rankFor(total) };
}

const ranks: [number, L][] = [
  [0, { es: 'Despertando', en: 'Awakening' }],
  [20, { es: 'Constructor', en: 'Builder' }],
  [40, { es: 'Operador', en: 'Operator' }],
  [60, { es: 'Alto desempeño', en: 'High performer' }],
  [80, { es: 'NextMe Élite', en: 'NextMe Elite' }],
];
export const rankFor = (total: number): L => [...ranks].reverse().find(([min]) => total >= min)![1];

export const levelsDone = (s: Pick<State, 'progress'>) => authored.filter((l) => s.progress[l.id]).length;
