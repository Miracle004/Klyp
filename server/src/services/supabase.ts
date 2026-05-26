import { createClient, SupabaseClient } from '@supabase/supabase-js';

type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

const getSupabaseConfig = (): SupabaseConfig => {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration');
  }

  return { url, serviceRoleKey };
};

let _supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!_supabase) {
    const { url, serviceRoleKey } = getSupabaseConfig();
    _supabase = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _supabase;
};
