import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { zipToCoords } from "@/lib/geo";
import { categories } from "@/lib/mock/categories";
import { requireSeller } from "@/lib/auth";
import { enqueueJob } from "@/lib/jobs";

export async function POST(request: NextRequest) {
  try {
    const seller = await requireSeller();
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a seller." }, { status: 401 });
    }
    if (!seller.shop) {
      return NextResponse.json(
        { error: "Please set up your shop before creating listings." },
        { status: 403 }
      );
    }

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
    const validCategory = categories.find((c) => c.id === String(categoryId).trim());
    if (!validCategory) {
      errors.push("Invalid category. Please select a valid category.");
    } else if (!validCategory.parentId) {
      const hasSubs = categories.some((c) => c.parentId === validCategory!.id);
      if (hasSubs) {
        errors.push("Please select a specific subcategory, not a parent category.");
      }
    }
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

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }

    const zip = seller.shop.zip;
    const coords = zipToCoords(zip);
    if (!coords) {
      return NextResponse.json(
        { error: "Shop zip code is not in our service area. Update your shop location." },
        { status: 400 }
      );
    }

    const [sellerLat, sellerLng] = coords;
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server configuration error: Add SUPABASE_SERVICE_ROLE_KEY to .env.local" },
        { status: 503 }
      );
    }

    // Prevent duplicate listings: same seller + same title within last 10 minutes
    const trimmedTitle = String(title).trim();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from("listings")
      .select("id")
      .eq("seller_id", seller.profile.id)
      .eq("title", trimmedTitle)
      .gte("created_at", tenMinutesAgo)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You already created a listing with this title. Please wait a few minutes before creating a similar listing, or use a different title." },
        { status: 409 }
      );
    }

    const insertRow: Record<string, unknown> = {
      seller_id: seller.profile.id,
      title: trimmedTitle,
      description: String(description).trim(),
      price: Number(price),
      condition,
      category_id: String(categoryId).trim(),
      style_ids: styleIds.map((id: unknown) => String(id)),
      image_urls: imageUrls.map((url: unknown) => String(url)),
      quantity: Math.max(1, Number(quantity) || 1),
      delivery_option: deliveryOption,
      seller_name: seller.profile.name,
      seller_location: zip,
      seller_zip: zip,
      seller_lat: sellerLat,
      seller_lng: sellerLng,
      seller_email: seller.profile.email,
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
      const errDetail = process.env.NODE_ENV === "development" ? `: ${error.message}` : "";
      return NextResponse.json({ error: `Failed to create listing${errDetail}` }, { status: 500 });
    }

    // Enqueue background job for image processing (resize, thumbnails, etc.)
    await enqueueJob("process_listing_images", {
      payload: { listing_id: data.id, image_urls: imageUrls },
    });

    return NextResponse.json({ id: data.id });
  } catch (e) {
    console.error("POST /api/listings error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
