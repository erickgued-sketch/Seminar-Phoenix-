// Spaced review: 1, 3, 7, 14, 30 days, adjusted by performance.
import { addDays } from './dates';

export const INTERVALS = [1, 3, 7, 14, 30] as const;
export const GRADUATED = INTERVALS.length;

export type Srs = { srsStage: number; nextReview: string | null };

/** First schedule after completing a level. */
export const initial = (day: string): Srs => ({ srsStage: 0, nextReview: addDays(day, INTERVALS[0]) });

/** Correct recall advances one interval; a miss steps back one (never below the first). */
export const advance = (cur: Srs, correct: boolean, day: string): Srs => {
  const stage = correct ? cur.srsStage + 1 : Math.max(0, cur.srsStage - 1);
  if (stage >= GRADUATED) return { srsStage: GRADUATED, nextReview: null };
  return { srsStage: stage, nextReview: addDays(day, INTERVALS[stage]) };
};

export const isDue = (s: Srs, day: string): boolean => s.nextReview !== null && s.nextReview <= day;
