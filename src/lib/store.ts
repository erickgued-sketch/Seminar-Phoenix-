// Single persisted store (offline-first). Everything the user creates lives here and in
// AsyncStorage; an optional signed-in backup copies it to Supabase (see src/lib/backup.ts).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Lang } from '@/content/types';
import { addDays, diffDays, today } from './dates';
import { advance, initial } from './srs';

export type CoachStyle = 'warm' | 'direct' | 'elite';
export type Profile = {
  onboarded: boolean;
  name: string;
  lang: Lang;
  areas: string[];
  goalText: string;
  why: string;
  minutes: 3 | 10 | 25;
  coachStyle: CoachStyle;
  identity: string;
  reminder: string;
  /** User consent for the coach to use goals/reflections to personalise answers. */
  memoryConsent: boolean;
  email: string;
};
export type LevelProgress = {
  completedAt: string;
  score: number;
  reflection: string;
  commit: string;
  evidence?: { text: string; at: string };
  srsStage: number;
  nextReview: string | null;
};
export type Week = { week: number; focus: string; done: boolean };
export type Goal = {
  id: string;
  title: string;
  why: string;
  metric: string;
  deadline: string;
  identity: string;
  obstacles: string;
  dailyAction: string;
  weeks: Week[];
  active: boolean;
  createdAt: string;
  progress: number;
};
export type Habit = { id: string; name: string; area: string; goalId?: string; perWeek: number; createdAt: string; archived?: boolean };
export type DayLog = {
  prime?: { priorities: string[]; done: boolean[] };
  evening?: { won: string; learned: string; off: string; tomorrow: string };
  habits: string[];
  practices: string[];
};
export type JournalEntry = { id: string; practiceId: string; date: string; items: string[] };
export type CoachReply = {
  insight: string;
  source: { kind: 'seminar' | 'vault' | 'practice' | 'none'; title: string; pages: number[] };
  why: string;
  action: string;
  question: string;
  dataNote?: string;
  caveat?: string;
  safety?: boolean;
  engine: 'local' | 'cloud';
};
export type ChatMsg = { id: string; role: 'user' | 'coach'; text?: string; reply?: CoachReply; at: string };
export type VaultDoc = { id: string; title: string; text: string; addedAt: string };
export type Streak = { current: number; longest: number; lastActive: string | null; freezes: number };

export type State = {
  hydrated: boolean;
  profile: Profile;
  progress: Record<string, LevelProgress>;
  xp: number;
  hearts: number;
  streak: Streak;
  goals: Goal[];
  habits: Habit[];
  days: Record<string, DayLog>;
  journal: JournalEntry[];
  affirmations: string[];
  chat: ChatMsg[];
  vault: VaultDoc[];
};

type Actions = {
  setProfile: (p: Partial<Profile>) => void;
  completeLevel: (id: string, r: { score: number; reflection: string; commit: string }) => void;
  addEvidence: (id: string, text: string) => void;
  reviewLevel: (id: string, correct: boolean) => void;
  touch: () => void;
  addXp: (n: number) => void;
  saveGoal: (g: Goal) => void;
  removeGoal: (id: string) => void;
  toggleWeek: (goalId: string, week: number) => void;
  saveHabit: (h: Habit) => void;
  archiveHabit: (id: string) => void;
  toggleHabit: (id: string, day?: string) => void;
  setPrime: (priorities: string[]) => void;
  togglePriority: (i: number) => void;
  setEvening: (e: NonNullable<DayLog['evening']>) => void;
  logPractice: (practiceId: string, items: string[]) => void;
  setAffirmations: (a: string[]) => void;
  pushChat: (m: ChatMsg) => void;
  clearChat: () => void;
  addVault: (title: string, text: string) => void;
  removeVault: (id: string) => void;
  importAll: (s: Partial<State>) => void;
  resetAll: () => void;
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const emptyDay = (): DayLog => ({ habits: [], practices: [] });

export const initialState = (): State => ({
  hydrated: false,
  profile: { onboarded: false, name: '', lang: 'es', areas: [], goalText: '', why: '', minutes: 10, coachStyle: 'warm', identity: '', reminder: '08:00', memoryConsent: true, email: '' },
  progress: {},
  xp: 0,
  hearts: 5,
  streak: { current: 0, longest: 0, lastActive: null, freezes: 2 },
  goals: [],
  habits: [],
  days: {},
  journal: [],
  affirmations: [],
  chat: [],
  vault: [],
});

/** Pure streak transition, exported for tests. A missed single day is bridged by a freeze — no shaming, no reset. */
export function nextStreak(s: Streak, day: string): Streak {
  if (s.lastActive === day) return s;
  const gap = s.lastActive ? diffDays(s.lastActive, day) : Infinity;
  let { current, freezes } = s;
  if (gap === 1) current += 1;
  else if (gap === 2 && freezes > 0) {
    current += 1;
    freezes -= 1;
  } else current = 1;
  return { current, freezes, longest: Math.max(s.longest, current), lastActive: day };
}

const withDay = (days: State['days'], day: string, fn: (d: DayLog) => DayLog) => ({ ...days, [day]: fn(days[day] ?? emptyDay()) });

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState(),
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      touch: () => set((s) => ({ streak: nextStreak(s.streak, today()) })),
      addXp: (n) => set((s) => ({ xp: s.xp + n })),
      completeLevel: (id, r) => {
        const day = today();
        set((s) => {
          const first = !s.progress[id];
          return {
            progress: { ...s.progress, [id]: { ...(s.progress[id] ?? {}), completedAt: s.progress[id]?.completedAt ?? day, ...r, ...(first ? initial(day) : { srsStage: s.progress[id].srsStage, nextReview: s.progress[id].nextReview }) } },
            xp: s.xp + (first ? 20 + Math.round(r.score / 10) : 5),
            streak: nextStreak(s.streak, day),
          };
        });
      },
      addEvidence: (id, text) =>
        set((s) => (s.progress[id] ? { progress: { ...s.progress, [id]: { ...s.progress[id], evidence: { text, at: today() } } }, xp: s.xp + 15, streak: nextStreak(s.streak, today()) } : s)),
      reviewLevel: (id, correct) =>
        set((s) => {
          const p = s.progress[id];
          if (!p) return s;
          return { progress: { ...s.progress, [id]: { ...p, ...advance(p, correct, today()) } }, xp: s.xp + (correct ? 5 : 1), streak: nextStreak(s.streak, today()) };
        }),
      saveGoal: (g) =>
        set((s) => {
          const others = s.goals.filter((x) => x.id !== g.id).map((x) => (g.active ? { ...x, active: false } : x));
          return { goals: [g, ...others] };
        }),
      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      toggleWeek: (goalId, week) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const weeks = g.weeks.map((w) => (w.week === week ? { ...w, done: !w.done } : w));
            return { ...g, weeks, progress: Math.round((weeks.filter((w) => w.done).length / weeks.length) * 100) };
          }),
        })),
      saveHabit: (h) => set((s) => ({ habits: [...s.habits.filter((x) => x.id !== h.id), h] })),
      archiveHabit: (id) => set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, archived: true } : h)) })),
      toggleHabit: (id, day = today()) =>
        set((s) => {
          const had = s.days[day]?.habits.includes(id);
          return {
            days: withDay(s.days, day, (d) => ({ ...d, habits: had ? d.habits.filter((h) => h !== id) : [...d.habits, id] })),
            xp: s.xp + (had ? -2 : 2),
            streak: had ? s.streak : nextStreak(s.streak, today()),
          };
        }),
      setPrime: (priorities) =>
        set((s) => ({ days: withDay(s.days, today(), (d) => ({ ...d, prime: { priorities, done: priorities.map(() => false) } })), xp: s.xp + (s.days[today()]?.prime ? 0 : 5), streak: nextStreak(s.streak, today()) })),
      togglePriority: (i) =>
        set((s) => ({ days: withDay(s.days, today(), (d) => (d.prime ? { ...d, prime: { ...d.prime, done: d.prime.done.map((v, j) => (j === i ? !v : v)) } } : d)) })),
      setEvening: (e) =>
        set((s) => ({ days: withDay(s.days, today(), (d) => ({ ...d, evening: e })), xp: s.xp + (s.days[today()]?.evening ? 0 : 5), streak: nextStreak(s.streak, today()) })),
      logPractice: (practiceId, items) =>
        set((s) => ({
          journal: [{ id: uid(), practiceId, date: today(), items }, ...s.journal].slice(0, 500),
          days: withDay(s.days, today(), (d) => ({ ...d, practices: d.practices.includes(practiceId) ? d.practices : [...d.practices, practiceId] })),
          xp: s.xp + 5,
          streak: nextStreak(s.streak, today()),
        })),
      setAffirmations: (a) => set({ affirmations: a }),
      pushChat: (m) => set((s) => ({ chat: [...s.chat, m].slice(-80) })),
      clearChat: () => set({ chat: [] }),
      addVault: (title, text) => set((s) => ({ vault: [{ id: uid(), title, text, addedAt: today() }, ...s.vault] })),
      removeVault: (id) => set((s) => ({ vault: s.vault.filter((v) => v.id !== id) })),
      importAll: (data) => set((s) => ({ ...s, ...data, hydrated: true })),
      resetAll: () => set((s) => ({ ...initialState(), profile: { ...initialState().profile, lang: s.profile.lang }, hydrated: true })),
    }),
    {
      name: 'nextme-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated, ...rest }) => Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function')) as never,
      onRehydrateStorage: () => () => useStore.setState({ hydrated: true }),
    },
  ),
);

/** Plain data snapshot (for export, sync and the coach). */
export const snapshot = (): State => {
  const { hydrated, ...s } = useStore.getState();
  return JSON.parse(JSON.stringify({ hydrated, ...Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v !== 'function')) }));
};

export const activeGoal = (s: Pick<State, 'goals'>) => s.goals.find((g) => g.active);
export const habitsFor = (s: Pick<State, 'habits'>) => s.habits.filter((h) => !h.archived);
export { addDays };
