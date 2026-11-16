// Optional signed-in backup: one JSON snapshot per user in `user_snapshots` (RLS: owner only).
// The device stays the source of truth; nothing is uploaded unless the user signs in and taps Back up.
import { snapshot, useStore, type State } from './store';
import { supabase } from './supabase';

export async function sendCode(email: string): Promise<string | null> {
  if (!supabase) return 'cloud not configured';
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  return error?.message ?? null;
}
export async function verifyCode(email: string, token: string): Promise<string | null> {
  if (!supabase) return 'cloud not configured';
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  return error?.message ?? null;
}
export async function currentEmail(): Promise<string | null> {
  if (!supabase) return null;
  return (await supabase.auth.getUser()).data.user?.email ?? null;
}
export const signOut = async () => void (await supabase?.auth.signOut());

export async function backupNow(): Promise<string | null> {
  if (!supabase) return 'cloud not configured';
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return 'not signed in';
  const { hydrated, chat, ...data } = snapshot(); // chat history is not backed up
  const { error } = await supabase.from('user_snapshots').upsert({ user_id: user.id, data, updated_at: new Date().toISOString() });
  return error?.message ?? null;
}
export async function restore(): Promise<string | null> {
  if (!supabase) return 'cloud not configured';
  const { data, error } = await supabase.from('user_snapshots').select('data').maybeSingle();
  if (error) return error.message;
  if (!data) return 'no backup found';
  useStore.getState().importAll(data.data as Partial<State>);
  return null;
}
/** Erases the server copy (the on-device copy is erased from Profile → Delete all my data). */
export async function deleteCloudData(): Promise<string | null> {
  if (!supabase) return null;
  const { error } = await supabase.rpc('delete_my_data');
  return error?.message ?? null;
}
