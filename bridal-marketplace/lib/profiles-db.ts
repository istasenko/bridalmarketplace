import { createAdminClient } from "@/lib/supabase/server";

export type SellerProfile = {
  name: string;
  email: string;
};

/**
 * Fetch minimal seller profile for public shop page display.
 * Uses admin client to bypass RLS (profile is normally private).
 */
export async function fetchSellerProfile(sellerId: string): Promise<SellerProfile | null> {
  try {
    const supabase = createAdminClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", sellerId)
      .maybeSingle();
    if (error || !data) return null;
    return { name: data.name, email: data.email };
  } catch {
    return null;
  }
}
