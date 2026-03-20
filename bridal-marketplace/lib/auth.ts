import { headers } from "next/headers";
import { createClient, createAnonClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type ProfileWithShop = {
  profile: { id: string; role: string; name: string; email: string; zip: string | null };
  shop: { id: string; shop_name: string; shop_description: string | null; location: string; zip: string } | null;
};

/** Profile for any authenticated user (no shop required) */
export type ProfileBasic = {
  id: string;
  role: string;
  name: string;
  email: string;
  zip: string | null;
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
 * Require an authenticated user with profile. Returns profile or null.
 * Use when any logged-in user can act (e.g. creating a shop).
 */
export async function requireAuth(): Promise<ProfileBasic | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, name, email, zip")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;

  return {
    id: profile.id,
    role: profile.role,
    name: profile.name,
    email: profile.email,
    zip: profile.zip ?? null,
  };
}

/**
 * Require an authenticated seller (user with a shop). Returns profile + shop or null.
 * Seller = has a shop; anyone can create a shop to become a seller.
 */
export async function requireSeller(): Promise<ProfileWithShop | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: shop } = await supabase
    .from("shops")
    .select("id, shop_name, shop_description, location, zip")
    .eq("seller_id", user.id)
    .maybeSingle();

  if (!shop) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, name, email, zip")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;

  return {
    profile: {
      id: profile.id,
      role: profile.role,
      name: profile.name,
      email: profile.email,
      zip: profile.zip ?? null,
    },
    shop: {
      id: shop.id,
      shop_name: shop.shop_name,
      shop_description: shop.shop_description ?? null,
      location: shop.location,
      zip: shop.zip,
    },
  };
}
