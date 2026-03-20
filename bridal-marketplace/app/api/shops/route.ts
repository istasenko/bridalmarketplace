import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { zipToCoords } from "@/lib/geo";
import { requireAuth, requireSeller } from "@/lib/auth";

export async function GET() {
  const profile = await requireAuth();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 503 });
  }
  const { data: shop } = await supabase
    .from("shops")
    .select("id, shop_name, shop_description, location, zip")
    .eq("seller_id", profile.id)
    .maybeSingle();
  return NextResponse.json({ shop: shop ?? null });
}

export async function POST(request: NextRequest) {
  const profile = await requireAuth();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 503 });
  }
  const { data: existingShop } = await supabase
    .from("shops")
    .select("id")
    .eq("seller_id", profile.id)
    .maybeSingle();
  if (existingShop) {
    return NextResponse.json(
      { error: "Shop already exists. Use PATCH to update." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { shopName, shopDescription, zip } = body;

    if (!shopName?.trim()) {
      return NextResponse.json(
        { error: "Shop name is required" },
        { status: 400 }
      );
    }
    if (!zip?.trim()) {
      return NextResponse.json(
        { error: "Location (zip) is required" },
        { status: 400 }
      );
    }

    const zipClean = String(zip).replace(/\s/g, "").slice(0, 5);
    const coords = zipToCoords(zipClean);
    if (!coords) {
      return NextResponse.json(
        { error: "Zip code is not in our service area. Please use a valid NYC metro zip." },
        { status: 400 }
      );
    }

    const [lat, lng] = coords;

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from("shops")
      .insert({
        seller_id: profile.id,
        shop_name: String(shopName).trim(),
        shop_description: shopDescription?.trim() || null,
        location: zipClean,
        zip: zipClean,
        lat,
        lng,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Shops insert error:", error);
      return NextResponse.json({ error: "Failed to create shop" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (e) {
    console.error("POST /api/shops error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const seller = await requireSeller();
  if (!seller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!seller.shop) {
    return NextResponse.json(
      { error: "No shop found. Create one first via /sell/setup." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { shopName, shopDescription, zip } = body;

    const updates: Record<string, unknown> = {};

    if (shopName !== undefined) {
      const trimmed = String(shopName).trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Shop name cannot be empty" }, { status: 400 });
      }
      updates.shop_name = trimmed;
    }
    if (shopDescription !== undefined) {
      updates.shop_description = shopDescription?.trim() || null;
    }
    if (zip !== undefined && zip !== null && String(zip).trim()) {
      const zipClean = String(zip).replace(/\s/g, "").slice(0, 5);
      const coords = zipToCoords(zipClean);
      if (!coords) {
        return NextResponse.json(
          { error: "Zip code is not in our service area. Please use a valid NYC metro zip." },
          { status: 400 }
        );
      }
      updates.location = zipClean;
      updates.zip = zipClean;
      updates.lat = coords[0];
      updates.lng = coords[1];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 503 });
    }

    const { error } = await supabase
      .from("shops")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("seller_id", seller.profile.id);

    if (error) {
      console.error("Shops PATCH error:", error);
      return NextResponse.json({ error: "Failed to update shop" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/shops error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
