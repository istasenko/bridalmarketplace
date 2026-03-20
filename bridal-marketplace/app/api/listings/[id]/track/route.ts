import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/listings/[id]/track
 * Tracks view or contact events. Only counts when the viewer is NOT the listing owner.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const event = body?.event as string;

    if (event !== "view" && event !== "contact") {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server error" }, { status: 503 });
    }

    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select("seller_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (currentUser?.id === listing.seller_id) {
      return NextResponse.json({ ok: true, skipped: "owner" });
    }

    const column = event === "view" ? "view_count" : "contact_count";

    const { error } = await supabase.rpc("increment_listing_stat", {
      p_listing_id: id,
      p_column: column,
    });

    if (error) {
      const fallback = await supabase
        .from("listings")
        .select(column)
        .eq("id", id)
        .single();
      const current = (fallback.data as Record<string, number>)?.[column] ?? 0;
      const { error: updateError } = await supabase
        .from("listings")
        .update({ [column]: current + 1 })
        .eq("id", id);

      if (updateError) {
        console.error("Track update error:", updateError);
        return NextResponse.json(
          { error: "Stats not set up. Run the listing_stats migration in Supabase SQL Editor." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/listings/[id]/track error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
