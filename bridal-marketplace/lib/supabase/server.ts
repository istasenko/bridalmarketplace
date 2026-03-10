import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for server-side use (API routes, Server Components).
 * Returns null when env vars are missing (e.g. during build); callers should handle accordingly.
 */
export function createClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createSupabaseClient(url, anonKey);
}
