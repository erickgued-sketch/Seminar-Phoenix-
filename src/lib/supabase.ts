// Optional cloud backend. With no env vars the app runs fully local.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY; // public anon key only; service keys live in Edge Function secrets

export const cloudEnabled = Boolean(url && anon);
export const supabase: SupabaseClient | null = cloudEnabled
  ? createClient(url!, anon!, { auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
  : null;
