import { createAdminClient, createAnonClient } from "@/lib/supabase/server";

export type Shop = {
  id: string;
  sellerId: string;
  shopName: string;
  shopDescription: string | null;
  location: string;
  zip: string;
};

/**
 * Fetch a shop by seller ID. Returns null if shop doesn't exist.
 */
export async function fetchShopBySellerId(sellerId: string): Promise<Shop | null> {
  try {
    const supabase = createAdminClient() ?? createAnonClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("shops")
      .select("id, seller_id, shop_name, shop_description, location, zip")
      .eq("seller_id", sellerId)
      .maybeSingle();
    if (error) {
      console.error("fetchShopBySellerId error:", error);
      return null;
    }
    if (!data) return null;
    return {
      id: data.id,
      sellerId: data.seller_id,
      shopName: data.shop_name,
      shopDescription: data.shop_description ?? null,
      location: data.location,
      zip: data.zip,
    };
  } catch (e) {
    console.error("fetchShopBySellerId error:", e);
    return null;
  }
}
