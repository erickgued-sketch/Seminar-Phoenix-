// Lexical BM25 retrieval that runs on-device (works offline). The cloud coach replaces this
// with hybrid pgvector + full-text search (supabase/functions/coach).
import type { Lang } from '@/content/types';
import type { VaultDoc } from '../store';
import { seminarChunks, type Chunk } from './kb';

const STOP = new Set(
  'a al algo como con cual cuando de del el en es esta este esto la las lo los me mi mis mas muy no o para pero por que se si sin su sus te tu un una y ya yo hoy puedo quiero hacer tengo ser the a an and are as at be but by can do for from how i in is it me my not of on or so that this to what with you your want today have'.split(' '),
);
// Query expansion: everyday words → vocabulary used in the curriculum.
const SYN: Record<string, string[]> = {
  disciplina: ['habito', 'decision', 'practica', 'repeticion'], discipline: ['habit', 'decision', 'practice', 'repetition'],
  procrastin: ['ahora', 'urgencia', 'tarea', 'terminar'], postergar: ['ahora', 'urgencia', 'terminar'], posponer: ['ahora', 'urgencia', 'terminar'],
  ansiedad: ['preocupacion', 'paz', 'calma'], anxiety: ['worry', 'peace', 'calm'], estres: ['preocupacion', 'paz', 'relajacion'], stress: ['worry', 'peace', 'relaxation'],
  miedo: ['temor', 'fracaso', 'rechazo'], fear: ['failure', 'rejection'], enojo: ['culpa', 'responsable', 'emociones'], angry: ['blame', 'responsible', 'anger'], anger: ['blame', 'responsible'],
  confianza: ['autoestima', 'agrado', 'autoconcepto'], confidence: ['esteem', 'like', 'concept'], motivacion: ['deseo', 'razones', 'metas'], motivation: ['desire', 'reasons', 'goals'],
  enfoque: ['concentracion', 'prioridades'], focus: ['concentration', 'priorities'], dinero: ['financiera', 'libertad'], money: ['financial', 'freedom'],
  pareja: ['relaciones', 'comunicacion'], partner: ['relationships', 'communication'], hijos: ['amor', 'incondicional', 'criar'], kids: ['children', 'unconditional', 'love'],
  ideas: ['veinte', '20', 'silencio', 'creatividad'], dormir: ['descanso'], sleep: ['rest'], perdonar: ['perdon', 'soltar'], forgive: ['forgiveness', 'release'],
  agradecer: ['gracias', 'reconocer'], gratitude: ['thank', 'appreciate'], gratitud: ['gracias', 'reconocer'], meditar: ['meditacion', 'silencio', 'relajacion'], meditate: ['meditation', 'silence', 'relaxation'],
};

export const tokenize = (s: string): string[] =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem);

/** Light bilingual stemmer so "preocupado", "preocupación" and "preocupaciones" meet on one stem. */
export function stem(w: string): string {
  if (w.length <= 5) return w;
  const s = w.replace(/(aciones|acion|amientos?|imientos?|mente|idades|idad|ando|iendo|ados?|adas?|idos?|idas?|ations?|tions?|ness|ing|ies|ed|ly|ar|er|ir|os|as|es|s|o|a|e|y)$/, '');
  return s.length >= 4 ? s : w;
}

const expand = (tokens: string[]): string[] => {
  const out = [...tokens];
  for (const t of tokens) for (const [k, v] of Object.entries(SYN)) if (t.startsWith(k.slice(0, 8))) out.push(...v.flatMap(tokenize));
  return out;
};

export function vaultChunks(vault: VaultDoc[]): Chunk[] {
  return vault.flatMap((doc) =>
    doc.text.split(/\n{2,}|(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/).reduce<string[]>((acc, part) => {
      const last = acc[acc.length - 1];
      if (last !== undefined && last.length < 360) acc[acc.length - 1] = `${last} ${part}`.trim();
      else acc.push(part.trim());
      return acc;
    }, []).filter((t) => t.length > 20).map((text, i): Chunk => ({ id: `${doc.id}-${i}`, kind: 'vault', title: { es: doc.title, en: doc.title }, summary: { es: text, en: text }, text: { es: text, en: text }, pages: [] })),
  );
}

export type Hit = { chunk: Chunk; score: number };

export function search(query: string, lang: Lang, vault: VaultDoc[] = [], k = 3): Hit[] {
  const corpus = [...seminarChunks, ...vaultChunks(vault)];
  const docs = corpus.map((c) => tokenize(`${c.title[lang]} ${c.title[lang]} ${c.text[lang]}`));
  const q = [...new Set(expand(tokenize(query)))];
  if (!q.length) return [];
  const N = docs.length;
  const avg = docs.reduce((n, d) => n + d.length, 0) / N;
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1);
  const k1 = 1.4, b = 0.7;
  return docs
    .map((d, i): Hit => {
      let score = 0;
      for (const t of q) {
        const f = d.filter((w) => w === t).length;
        if (!f) continue;
        const idf = Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));
        score += (idf * f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.length) / avg));
      }
      return { chunk: corpus[i], score };
    })
    .filter((h) => h.score > 0)
    .sort((a, b2) => b2.score - a.score)
    .slice(0, k);
}

/** Below this the coach says it found no grounding instead of guessing. */
export const MIN_SCORE = 2.2;
