import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";

/**
 * Supabase client for server-side use (API routes, Server Components, Server Actions).
 * Uses cookies for session; callers should use getUser() for auth checks (not getSession).
 *
 * Also supports Authorization: Bearer <access_token> for API clients (e.g. Postman).
 * Get the access_token from the sb-*-auth-token cookie: decode the base64 part and use the access_token field.
 */
export async function createClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (bearerToken) {
    return createSupabaseClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${bearerToken}` } },
    });
  }

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from Server Component; ignore (middleware handles writes)
        }
      },
    },
  });
}

/** Custom fetch that bypasses Next.js cache - ensures fresh data in production */
const noCacheFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

/**
 * Anonymous Supabase client for public reads (no session/cookies).
 * Use for fetching listings, etc. when auth is not needed.
 * Uses no-cache fetch so marketplace listings are always fresh (important for production).
 */
export function createAnonClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createSupabaseClient(url, anonKey, { global: { fetch: noCacheFetch } });
}

/**
 * Admin client using service role key. Bypasses RLS.
 * Use ONLY for operations where auth has already been validated (e.g. insert after requireSeller()).
 * Never expose this client to the browser or trust unvalidated user input for sensitive fields.
 * Uses no-cache fetch so marketplace listings are always fresh (important for production).
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false },
    global: { fetch: noCacheFetch },
  });
}
