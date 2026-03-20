import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { zipToCoords } from "@/lib/geo";
import { categories } from "@/lib/mock/categories";
import { requireSeller } from "@/lib/auth";
import { enqueueJob } from "@/lib/jobs";

type RouteParams = { params: Promise<{ id: string }> };

async function ensureOwnership(listingId: string) {
  const seller = await requireSeller();
  if (!seller) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!seller.shop) return { error: NextResponse.json({ error: "Shop required" }, { status: 403 }) };

  const supabase = createAdminClient();
  if (!supabase) {
    return { error: NextResponse.json({ error: "Server error" }, { status: 503 }) };
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", listingId)
    .maybeSingle();

  if (error || !listing) return { error: NextResponse.json({ error: "Listing not found" }, { status: 404 }) };
  if (listing.seller_id !== seller.profile.id) {
    return { error: NextResponse.json({ error: "You can only edit your own listings" }, { status: 403 }) };
  }

  return { seller, supabase };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await ensureOwnership(id);
    if ("error" in result) return result.error;
    const { seller, supabase } = result;

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

    if (title !== undefined && !title?.trim()) errors.push("Title cannot be empty");
    if (description !== undefined && !description?.trim()) errors.push("Description cannot be empty");
    if (price !== undefined && (price == null || Number(price) < 0)) errors.push("Valid price is required");
    if (condition !== undefined && (!condition || !validConditions.includes(condition))) {
      errors.push("Invalid condition");
    }
    if (kind === "creator" && creatorListingType !== undefined) {
      const validCreatorTypes = ["handmade", "vintage", "craft_supplies"];
      if (!validCreatorTypes.includes(creatorListingType)) errors.push("Invalid creator type");
      if (madeToOrder === true) {
        const days = Number(leadTimeDays);
        if (!Number.isInteger(days) || days < 1 || days > 365) errors.push("Lead time 1-365 days");
      }
    }
    if (categoryId !== undefined) {
      const validCategory = categories.find((c) => c.id === String(categoryId).trim());
      if (!validCategory) errors.push("Invalid category");
      else if (validCategory.parentId === undefined) {
        const hasSubs = categories.some((c) => c.parentId === validCategory.id);
        if (hasSubs) errors.push("Select a subcategory");
      }
    }
    if (styleIds !== undefined) {
      if (!Array.isArray(styleIds) || styleIds.length === 0) errors.push("At least one style required");
    }
    if (imageUrls !== undefined) {
      if (!Array.isArray(imageUrls) || imageUrls.length === 0) errors.push("At least one image required");
    }
    if (deliveryOption !== undefined) {
      const validDelivery = ["pickup_only", "ship_only", "both"];
      if (!validDelivery.includes(deliveryOption)) errors.push("Invalid delivery option");
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }

    const zip = seller.shop.zip;
    const coords = zipToCoords(zip);
    if (!coords) {
      return NextResponse.json({ error: "Shop zip not in service area" }, { status: 400 });
    }
    const [sellerLat, sellerLng] = coords;

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = String(title).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (price !== undefined) updates.price = Number(price);
    if (condition !== undefined) updates.condition = condition;
    if (categoryId !== undefined) updates.category_id = String(categoryId).trim();
    if (styleIds !== undefined) updates.style_ids = styleIds.map((x: unknown) => String(x));
    if (imageUrls !== undefined) updates.image_urls = imageUrls.map((x: unknown) => String(x));
    if (quantity !== undefined) updates.quantity = Math.max(1, Number(quantity) || 1);
    if (deliveryOption !== undefined) updates.delivery_option = deliveryOption;
    if (listingKind !== undefined) updates.listing_kind = kind;

    if (kind === "creator") {
      if (creatorListingType !== undefined) updates.creator_listing_type = creatorListingType;
      if (madeToOrder !== undefined) {
        updates.made_to_order = Boolean(madeToOrder);
        if (!madeToOrder) updates.lead_time_days = null;
        else if (leadTimeDays !== undefined) {
          updates.lead_time_days = Math.min(365, Math.max(1, Number(leadTimeDays) || 1));
        }
      }
    }

    const { error } = await supabase.from("listings").update(updates).eq("id", id).eq("seller_id", seller.profile.id);

    if (error) {
      console.error("Listings PATCH error:", error);
      return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
    }

    if (imageUrls !== undefined) {
      await enqueueJob("process_listing_images", { payload: { listing_id: id, image_urls: imageUrls } });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/listings/[id] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await ensureOwnership(id);
    if ("error" in result) return result.error;
    const { seller, supabase } = result;

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", id)
      .eq("seller_id", seller.profile.id);

    if (error) {
      console.error("Listings DELETE error:", error);
      return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/listings/[id] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
