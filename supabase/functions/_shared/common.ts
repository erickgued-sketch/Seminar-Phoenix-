// Shared helpers for Edge Functions (Deno). Secrets (ANTHROPIC_API_KEY, service role key) exist
// only here on the server — never in the app bundle.
import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json' } });

/** Model is configurable from the server (supabase secrets set COACH_MODEL=…). */
export const MODEL = Deno.env.get('COACH_MODEL') ?? 'claude-opus-5-5';
export const anthropic = () => new Anthropic(); // reads ANTHROPIC_API_KEY from function secrets

/** Client that acts AS THE CALLER (RLS applies). Returns null when the JWT is missing or invalid. */
export async function userClient(req: Request): Promise<{ db: SupabaseClient; userId: string } | null> {
  const auth = req.headers.get('Authorization');
  if (!auth) return null;
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data } = await db.auth.getUser();
  return data.user ? { db, userId: data.user.id } : null;
}
/** Service-role client (bypasses RLS) — only for admin-gated functions. */
export const adminClient = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

export async function isAdmin(db: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await db.from('profiles').select('role').eq('user_id', userId).maybeSingle();
  return data?.role === 'admin';
}

// Built-in embedding model of the Supabase Edge Runtime (384 dims) — no third-party key needed.
// deno-lint-ignore no-explicit-any
const session = new (globalThis as any).Supabase.ai.Session('gte-small');
export const embed = async (text: string): Promise<number[]> => await session.run(text.slice(0, 2000), { mean_pool: true, normalize: true });
