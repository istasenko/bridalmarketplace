import { headers } from "next/headers";
import { createClient, createAnonClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type ProfileWithShop = {
  profile: { id: string; role: string; name: string; email: string; zip: string | null };
  shop: { id: string; shop_name: string; shop_description: string | null; location: string; zip: string } | null;
};

/**
 * Get the currently authenticated user (validated against Auth server).
 * Returns null if not authenticated or token invalid.
 * Supports both cookies and Authorization: Bearer <token> (for Postman, etc.).
 */
export async function getCurrentUser(): Promise<User | null> {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (bearerToken) {
    const supabase = createAnonClient();
    if (!supabase) return null;
    const { data: { user }, error } = await supabase.auth.getUser(bearerToken);
    if (error || !user) return null;
    return user;
  }

  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Require an authenticated seller. Returns user + profile + shop or null.
 * Use in API routes that require seller auth.
 */
export async function requireSeller(): Promise<ProfileWithShop | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, name, email, zip")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "seller") return null;

  const { data: shop } = await supabase
    .from("shops")
    .select("id, shop_name, shop_description, location, zip")
    .eq("seller_id", user.id)
    .maybeSingle();

  return {
    profile: {
      id: profile.id,
      role: profile.role,
      name: profile.name,
      email: profile.email,
      zip: profile.zip ?? null,
    },
    shop: shop
      ? {
          id: shop.id,
          shop_name: shop.shop_name,
          shop_description: shop.shop_description ?? null,
          location: shop.location,
          zip: shop.zip,
        }
      : null,
  };
}
