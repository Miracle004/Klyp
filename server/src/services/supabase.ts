import { createClient } from '@supabase/supabase-js';

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

const { url, serviceRoleKey } = getSupabaseConfig();

export const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
