import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSeller } from "@/lib/auth";

/**
 * GET /api/me — Returns current user's profile and shop (if seller).
 * 401 if not authenticated.
 */
export async function GET() {
  const user = await (async () => {
    const supabase = await createClient();
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  })();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seller = await requireSeller();
  if (seller) {
    return NextResponse.json({
      profile: seller.profile,
      shop: seller.shop,
      role: "seller",
    });
  }

  // Browser or other - fetch profile
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, name, email, zip")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    profile: profile ?? { id: user.id, role: "browser", name: user.email, email: user.email, zip: null },
    shop: null,
    role: profile?.role ?? "browser",
  });
}
