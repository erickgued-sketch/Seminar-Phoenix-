import { lastNDays, today } from '../dates';
import { snapshot, type CoachReply } from '../store';
import { cloudEnabled, supabase } from '../supabase';
import { composeReply } from './compose';

/** Cloud coach (RAG + LLM) when configured and signed in; grounded local coach otherwise or on any failure. */
export async function askCoach(message: string): Promise<CoachReply> {
  const s = snapshot();
  const local = () => composeReply(message, s);
  if (!cloudEnabled || !supabase) return local();
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return local();
    const goal = s.profile.memoryConsent ? s.goals.find((g) => g.active) : undefined;
    const week = lastNDays(today(), 7);
    const { data, error } = await supabase.functions.invoke('coach', {
      body: {
        message,
        lang: s.profile.lang,
        style: s.profile.coachStyle,
        // Only what is needed to personalise, and only with consent.
        context: s.profile.memoryConsent
          ? { goal: goal && { title: goal.title, why: goal.why, dailyAction: goal.dailyAction }, streak: s.streak.current, habitCheckins7d: week.reduce((n, d) => n + (s.days[d]?.habits.length ?? 0), 0), levelsDone: Object.keys(s.progress).length }
          : {},
      },
    });
    if (error || !data?.insight) return local();
    return { ...(data as CoachReply), engine: 'cloud' };
  } catch {
    return local();
  }
}
