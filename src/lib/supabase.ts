import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getEnvVar(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return undefined;
}

export function getSupabase(): { client: SupabaseClient | null; error: string | null } {
  const url = getEnvVar('SUPABASE_URL');
  const key = getEnvVar('SUPABASE_ANON_KEY');

  if (!url || !key) {
    return {
      client: null,
      error: `Missing environment variables. SUPABASE_URL: ${url ? 'set' : 'missing'}, SUPABASE_ANON_KEY: ${key ? 'set' : 'missing'}`
    };
  }

  try {
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    const client = createClient(formattedUrl, key);
    return { client, error: null };
  } catch (err: any) {
    return { client: null, error: err?.message || 'Failed to initialize Supabase client.' };
  }
}
