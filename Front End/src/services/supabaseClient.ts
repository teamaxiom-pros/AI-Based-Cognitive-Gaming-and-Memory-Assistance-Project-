import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration constants with prioritized environment variable resolution
export const SUPABASE_URL: string =
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL ||
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://bhbvuyiiccsujrgsfncn.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY: string =
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_7mvOsamI_SIEsu_gHp-PGg_rcfk8Imq';

let clientInstance: SupabaseClient | null = null;

try {
  if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
} catch (error) {
  console.error('[SupabaseClient] Initialization failed:', error);
}

export const supabase = clientInstance;
export const isSupabaseConfigured = Boolean(clientInstance && SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

/**
 * Utility to extract clean host display string (e.g., bhbvuyiiccsujrgsfncn.supabase.co)
 */
export function getSupabaseHost(): string {
  try {
    return new URL(SUPABASE_URL).hostname;
  } catch {
    return 'bhbvuyiiccsujrgsfncn.supabase.co';
  }
}
