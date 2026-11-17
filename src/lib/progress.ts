import { authored, chapterOf } from '@/content/curriculum';
import type { Chapter, Level } from '@/content/types';
import { isDue } from './srs';
import type { State } from './store';

type P = Pick<State, 'progress'>;
/** Levels unlock strictly in order. */
export const isUnlocked = (s: P, id: string): boolean => {
  const i = authored.findIndex((l) => l.id === id);
  return i === 0 || (i > 0 && !!s.progress[authored[i - 1].id]);
};
export const nextLevel = (s: P): Level | undefined => authored.find((l) => !s.progress[l.id]);
export const dueReviews = (s: P, day: string): Level[] => authored.filter((l) => s.progress[l.id] && isDue(s.progress[l.id], day));
/** Completed levels whose real-life application has not been recorded yet (oldest first). */
export const pendingEvidence = (s: P): Level[] => authored.filter((l) => s.progress[l.id] && !s.progress[l.id].evidence);

/** What finishing this level opens up: the next chapter, the end of the program, or nothing special. */
export type Milestone = { kind: 'chapter'; next: Chapter } | { kind: 'program' } | null;
export const milestoneOf = (id: string): Milestone => {
  const i = authored.findIndex((l) => l.id === id);
  if (i < 0) return null;
  if (i === authored.length - 1) return { kind: 'program' };
  return authored[i + 1].chapter !== authored[i].chapter ? { kind: 'chapter', next: chapterOf(authored[i + 1].chapter) } : null;
};
