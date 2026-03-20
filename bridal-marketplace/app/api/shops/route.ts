import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { zipToCoords } from "@/lib/geo";
import { requireSeller } from "@/lib/auth";

export async function GET() {
  const seller = await requireSeller();
  if (!seller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ shop: seller.shop });
}

export async function POST(request: NextRequest) {
  const seller = await requireSeller();
  if (!seller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (seller.shop) {
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
        seller_id: seller.profile.id,
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
