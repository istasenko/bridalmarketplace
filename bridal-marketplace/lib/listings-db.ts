import type { Listing } from "@/types/listing";
import { createAnonClient, createAdminClient } from "@/lib/supabase/server";

type DbListing = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category_id: string;
  style_ids: string[];
  image_urls: string[];
  quantity: number;
  delivery_option: string;
  seller_name: string;
  seller_location: string;
  seller_zip: string;
  seller_lat: number | null;
  seller_lng: number | null;
  seller_email: string;
  created_at: string;
  listing_kind?: string | null;
  creator_listing_type?: string | null;
  made_to_order?: boolean | null;
  lead_time_days?: number | null;
};

function dbRowToListing(row: DbListing): Listing {
  const deliveryOption = row.delivery_option as "pickup_only" | "ship_only" | "both";
  const ships = deliveryOption === "ship_only" || deliveryOption === "both";
  const listingKind = row.listing_kind === "creator" ? "creator" : "reselling";
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    condition: row.condition as "new" | "like new" | "gently used" | "used",
    categoryId: row.category_id,
    styleIds: row.style_ids ?? [],
    imageUrls: row.image_urls ?? [],
    quantity: row.quantity,
    deliveryOption,
    ships,
    listingKind: listingKind as "reselling" | "creator",
    creatorListingType:
      row.creator_listing_type && ["handmade", "vintage", "craft_supplies"].includes(row.creator_listing_type)
        ? (row.creator_listing_type as "handmade" | "vintage" | "craft_supplies")
        : undefined,
    madeToOrder: row.made_to_order === true,
    leadTimeDays: row.lead_time_days != null ? Number(row.lead_time_days) : undefined,
    seller: {
      name: row.seller_name,
      location: row.seller_location || `Zip ${row.seller_zip}`,
      zip: row.seller_zip,
      contactEmail: row.seller_email,
      lat: row.seller_lat != null ? Number(row.seller_lat) : undefined,
      lng: row.seller_lng != null ? Number(row.seller_lng) : undefined,
    },
    createdAt: row.created_at,
  };
}

export async function fetchListingsFromDb(): Promise<Listing[]> {
  try {
    // Use admin client to bypass RLS - marketplace listings are public.
    // Falls back to anon if admin key is not configured (e.g. in some dev setups).
    const supabase = createAdminClient() ?? createAnonClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("fetchListingsFromDb error:", error);
      return [];
    }
    return (data ?? []).map((row) => dbRowToListing(row as unknown as DbListing));
  } catch (e) {
    console.error("fetchListingsFromDb error:", e);
    return [];
  }
}

/**
 * Fetch a single listing by ID directly. More efficient than fetchListingsFromDb + filter,
 * and avoids potential RLS/caching issues when viewing a newly created listing.
 */
export async function fetchListingByIdFromDb(id: string): Promise<Listing | undefined> {
  try {
    const supabase = createAnonClient();
    if (!supabase) return undefined;
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.error("fetchListingByIdFromDb error:", error);
      return undefined;
    }
    if (!data) return undefined;
    return dbRowToListing(data as unknown as DbListing);
  } catch (e) {
    console.error("fetchListingByIdFromDb error:", e);
    return undefined;
  }
}
