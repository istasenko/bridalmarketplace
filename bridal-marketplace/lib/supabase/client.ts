import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for browser/client components.
 * Throws when env vars are missing (client-side usage typically requires them).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createSupabaseClient(url, anonKey);
}
