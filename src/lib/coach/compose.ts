// Offline coach. It never invents content: the insight is the retrieved principle (with its
// source), and personalisation only uses data the user actually recorded.
import type { Lang } from '@/content/types';
import { lastNDays, today } from '../dates';
import type { CoachReply, CoachStyle, State } from '../store';
import { MIN_SCORE, search } from './retrieval';

type Ctx = Pick<State, 'profile' | 'goals' | 'habits' | 'days' | 'streak' | 'progress' | 'vault'>;
const T = (lang: Lang, es: string, en: string) => (lang === 'en' ? en : es);

const SAFETY = /suicid|matarme|quitarme la vida|no quiero vivir|hacerme da[nñ]o|autolesi|kill myself|end my life|self.?harm|hurt myself/i;

const tone: Record<CoachStyle, { es: string; en: string }> = {
  warm: { es: 'Vamos paso a paso.', en: 'Let us take this one step at a time.' },
  direct: { es: 'Al grano.', en: 'Straight to the point.' },
  elite: { es: 'El estándar es alto y puedes sostenerlo.', en: 'The standard is high and you can hold it.' },
};

export function dataNote(ctx: Ctx, lang: Lang): string | undefined {
  const week = lastNDays(today(), 7);
  const habits = ctx.habits.filter((h) => !h.archived);
  const hits = week.reduce((n, d) => n + (ctx.days[d]?.habits.length ?? 0), 0);
  const pending = Object.values(ctx.progress).filter((p) => !p.evidence).length;
  const bits: string[] = [];
  if (ctx.streak.current > 0) bits.push(T(lang, `racha de ${ctx.streak.current} día(s)`, `${ctx.streak.current}-day streak`));
  if (habits.length) bits.push(T(lang, `${hits} marca(s) de hábito en 7 días`, `${hits} habit check-in(s) in 7 days`));
  if (pending) bits.push(T(lang, `${pending} nivel(es) sin evidencia de aplicación`, `${pending} level(s) with no evidence of application yet`));
  return bits.length ? T(lang, `Según tus registros: ${bits.join(', ')}.`, `From your records: ${bits.join(', ')}.`) : undefined;
}

export function composeReply(message: string, ctx: Ctx): CoachReply {
  const lang = ctx.profile.lang;
  if (SAFETY.test(message)) {
    return {
      engine: 'local', safety: true, source: { kind: 'none', title: '', pages: [] },
      insight: T(lang, 'Lo que estás sintiendo importa, y mereces apoyo humano ahora mismo.', 'What you are feeling matters, and you deserve human support right now.'),
      why: T(lang, 'Soy una herramienta de aprendizaje, no un servicio de salud mental ni de emergencias.', 'I am a learning tool, not a mental-health or emergency service.'),
      action: T(lang, 'Contacta ahora con los servicios de emergencia o la línea de crisis de tu país, o con una persona de confianza que pueda acompañarte.', 'Contact your local emergency services or crisis line now, or a trusted person who can be with you.'),
      question: T(lang, '¿A quién puedes llamar en este momento?', 'Who can you call right now?'),
    };
  }
  const goal = ctx.profile.memoryConsent ? ctx.goals.find((g) => g.active) : undefined;
  const hits = search(message, lang, ctx.vault);
  const top = hits[0];
  const note = ctx.profile.memoryConsent ? dataNote(ctx, lang) : undefined;

  if (!top || top.score < MIN_SCORE) {
    return {
      engine: 'local', source: { kind: 'none', title: '', pages: [] }, dataNote: note,
      insight: T(lang, 'No encontré en el programa ni en tu bóveda un principio que responda directamente a eso, y prefiero no inventarlo.', 'I did not find a principle in the program or your vault that directly answers that, and I would rather not make one up.'),
      why: T(lang, 'Puedo ayudarte mejor si lo relacionas con una meta, un hábito, una emoción o una decisión concreta.', 'I can help better if you tie it to a specific goal, habit, emotion or decision.'),
      action: T(lang, 'Escribe en una frase qué quieres que sea distinto esta semana.', 'Write in one sentence what you want to be different this week.'),
      question: T(lang, '¿Qué situación concreta de hoy te hizo preguntar esto?', 'Which specific situation today made you ask this?'),
    };
  }
  const c = top.chunk;
  const first = c.text[lang].split(/(?<=[.!?])\s+/).slice(0, c.kind === 'vault' ? 2 : 1).join(' ');
  const goalBit = goal
    ? T(lang, `Lo conecto con tu meta «${goal.title}»: ${tone[ctx.profile.coachStyle].es} Aplicarlo hoy te acerca más que entenderlo mejor.`, `I connect it to your goal "${goal.title}": ${tone[ctx.profile.coachStyle].en} Applying it today moves you more than understanding it better.`)
    : T(lang, `${tone[ctx.profile.coachStyle].es} Sin una meta activa es difícil personalizar: créala en Hoy → Arquitecto de metas.`, `${tone[ctx.profile.coachStyle].en} Without an active goal it is hard to personalise: create one in Today → Goal Architect.`);
  return {
    engine: 'local',
    insight: first,
    source: { kind: c.kind, title: c.title[lang], pages: c.pages },
    why: goalBit,
    action: c.action?.[lang] ?? T(lang, `Escribe ahora una situación de hoy donde aplicarás «${c.title.es}» y da el primer paso en menos de 5 minutos.`, `Write down one situation today where you will apply "${c.title.en}" and take the first step within 5 minutes.`),
    question: c.question?.[lang] ?? T(lang, '¿Qué harías distinto hoy si te tomaras en serio este principio?', 'What would you do differently today if you took this principle seriously?'),
    dataNote: note,
    caveat: c.caveat?.[lang],
  };
}

export const modes = (lang: Lang): { min: number; text: string }[] => [
  { min: 2, text: T(lang, 'Solo el primer paso, ahora.', 'Just the first step, now.') },
  { min: 10, text: T(lang, 'La acción completa, sin interrupciones.', 'The full action, uninterrupted.') },
  { min: 25, text: T(lang, 'Un bloque de enfoque: acción + registrar evidencia.', 'A focus block: action + log the evidence.') },
];
