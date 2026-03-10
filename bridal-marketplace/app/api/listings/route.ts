import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { zipToCoords } from "@/lib/geo";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      price,
      condition,
      categoryId,
      styleIds,
      imageUrls,
      quantity = 1,
      deliveryOption = "both",
      sellerName,
      sellerEmail,
      sellerZip,
      listingKind = "reselling",
      creatorListingType,
      madeToOrder = false,
      leadTimeDays,
    } = body;

    const errors: string[] = [];
    const kind = listingKind === "creator" ? "creator" : "reselling";
    const validResellerConditions = ["like new", "gently used", "used"];
    const validCreatorConditions = ["new", "like new", "gently used", "used"];
    const validConditions = kind === "creator" ? validCreatorConditions : validResellerConditions;

    if (!title?.trim()) errors.push("Title is required");
    if (!description?.trim()) errors.push("Description is required");
    if (price == null || Number(price) < 0) errors.push("Valid price is required");
    if (!condition || !validConditions.includes(condition)) {
      errors.push(
        kind === "creator"
          ? "Condition must be new, like new, gently used, or used"
          : "Condition must be like new, gently used, or used"
      );
    }
    if (kind === "creator") {
      const validCreatorTypes = ["handmade", "vintage", "craft_supplies"];
      if (!creatorListingType || !validCreatorTypes.includes(creatorListingType)) {
        errors.push("Creator listing type must be handmade, vintage, or craft_supplies");
      }
      if (madeToOrder === true) {
        const days = Number(leadTimeDays);
        if (!Number.isInteger(days) || days < 1 || days > 365) {
          errors.push("Lead time must be between 1 and 365 days when made to order");
        }
      }
    }
    if (!categoryId?.trim()) errors.push("Category is required");
    if (!Array.isArray(styleIds) || styleIds.length === 0) {
      errors.push("At least one style is required");
    }
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      errors.push("At least one image is required");
    }
    const validDelivery = ["pickup_only", "ship_only", "both"];
    if (!deliveryOption || !validDelivery.includes(deliveryOption)) {
      errors.push("Delivery option must be pickup_only, ship_only, or both");
    }
    if (!sellerName?.trim()) errors.push("Seller name is required");
    if (!sellerEmail?.trim()) errors.push("Seller email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerEmail?.trim())) {
      errors.push("Valid seller email is required");
    }
    if (!sellerZip?.trim()) errors.push("Location (zip) is required");

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }

    const zip = String(sellerZip).replace(/\s/g, "").slice(0, 5);
    const coords = zipToCoords(zip);
    if (!coords) {
      return NextResponse.json(
        { error: "Zip code is not in our service area. Please use a valid NYC metro zip." },
        { status: 400 }
      );
    }

    const [sellerLat, sellerLng] = coords;
    const supabase = createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server configuration error: Supabase not configured" },
        { status: 503 }
      );
    }

    const insertRow: Record<string, unknown> = {
      title: String(title).trim(),
      description: String(description).trim(),
      price: Number(price),
      condition,
      category_id: String(categoryId).trim(),
      style_ids: styleIds.map((id: unknown) => String(id)),
      image_urls: imageUrls.map((url: unknown) => String(url)),
      quantity: Math.max(1, Number(quantity) || 1),
      delivery_option: deliveryOption,
      seller_name: String(sellerName).trim(),
      seller_location: zip,
      seller_zip: zip,
      seller_lat: sellerLat,
      seller_lng: sellerLng,
      seller_email: String(sellerEmail).trim(),
      listing_kind: kind,
    };
    if (kind === "creator") {
      insertRow.creator_listing_type = creatorListingType;
      insertRow.made_to_order = Boolean(madeToOrder);
      if (madeToOrder) {
        insertRow.lead_time_days = Math.min(365, Math.max(1, Number(leadTimeDays) || 1));
      }
    }

    const { data, error } = await supabase
      .from("listings")
      .insert(insertRow)
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (e) {
    console.error("POST /api/listings error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
