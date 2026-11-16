// Goal Architect: turns a raw wish into an editable 90-day plan. Structure follows the
// seminar's 12-step method (pp. 125–136): desire, belief, write it, why, starting point,
// deadline, obstacles, knowledge, people, plan, visualization, persistence.
import type { Lang } from '@/content/types';
import { addDays, today } from './dates';
import { uid, type Goal, type Week } from './store';

export type Draft = { title: string; why: string; metric: string; days: number; obstacles: string; dailyAction: string; identity: string };

const phases = (lang: Lang) =>
  lang === 'en'
    ? [
        ['Foundation', ['Write the goal in the present tense and read it daily', 'Measure your starting point', 'Do the daily action 5 days', 'Name your biggest obstacle and one way around it']],
        ['Momentum', ['Learn the one skill that helps most', 'Ask one person for help or feedback', 'Raise the bar on the daily action', 'Review what works; drop what does not']],
        ['Consolidation', ['Protect the habit on your hardest day', 'Measure progress against your metric', 'Close open loops and pending tasks', 'Run the final review and set the next 90 days']],
      ]
    : [
        ['Fundamento', ['Escribe la meta en presente y léela a diario', 'Mide tu punto de partida', 'Cumple la acción diaria 5 días', 'Nombra tu mayor obstáculo y una forma de rodearlo']],
        ['Impulso', ['Aprende la habilidad que más te ayuda', 'Pide ayuda o retroalimentación a una persona', 'Sube el nivel de la acción diaria', 'Revisa qué funciona y suelta lo que no']],
        ['Consolidación', ['Protege el hábito en tu día más difícil', 'Mide el avance frente a tu indicador', 'Cierra pendientes abiertos', 'Haz la revisión final y define los próximos 90 días']],
      ];

export function buildWeeks(days: number, lang: Lang): Week[] {
  const n = Math.max(1, Math.round(days / 7));
  const ph = phases(lang) as [string, string[]][];
  return Array.from({ length: n }, (_, i) => {
    const p = Math.min(2, Math.floor((i / n) * 3));
    const list = ph[p][1];
    const per = Math.max(1, Math.ceil(n / 3));
    return { week: i + 1, focus: `${ph[p][0]} · ${list[Math.min(list.length - 1, Math.floor(((i % per) / per) * list.length))]}`, done: false };
  });
}

/** A metric makes the goal checkable ("clarity precedes power"). */
export const hasNumber = (s: string) => /\d/.test(s);

export function draftIssues(d: Draft, lang: Lang): string[] {
  const t = (es: string, en: string) => (lang === 'en' ? en : es);
  const out: string[] = [];
  if (d.title.trim().length < 6) out.push(t('Describe la meta con más precisión.', 'Describe the goal more precisely.'));
  if (!d.why.trim()) out.push(t('Añade al menos una razón: los porqués sostienen la meta.', 'Add at least one reason: your whys sustain the goal.'));
  if (!hasNumber(d.metric)) out.push(t('El indicador necesita un número para poder medirse.', 'The metric needs a number so it can be measured.'));
  if (!d.dailyAction.trim()) out.push(t('Define una acción diaria que dependa solo de ti.', 'Define a daily action that depends only on you.'));
  return out;
}

export function toGoal(d: Draft, lang: Lang, id = uid()): Goal {
  return {
    id, title: d.title.trim(), why: d.why.trim(), metric: d.metric.trim(), identity: d.identity.trim(), obstacles: d.obstacles.trim(),
    dailyAction: d.dailyAction.trim(), deadline: addDays(today(), d.days), weeks: buildWeeks(d.days, lang), active: true, createdAt: today(), progress: 0,
  };
}
