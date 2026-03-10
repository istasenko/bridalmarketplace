import type { Listing, ListingFilters, Category, Style } from "@/types/listing";
import { zipToCoords, distanceMiles } from "@/lib/geo";

/**
 * Pure filter function: same logic as getListings but works with any listing array.
 * Used for client-side filtering so the list updates immediately when params change.
 */
export function applyListingFilters(
  listings: Listing[],
  filters: ListingFilters,
  categories: Category[],
  styles: Style[]
): Listing[] {
  let result = [...listings];

  if (filters.category) {
    const category = categories.find((c) => c.slug === filters.category);
    if (category) {
      result = result.filter((l) => l.categoryId === category.id);
    }
  }

  if (filters.style) {
    const style = styles.find((s) => s.slug === filters.style);
    if (style) {
      result = result.filter((l) => l.styleIds.includes(style.id));
    }
  }

  if (filters.zip?.trim() && filters.maxMiles != null && filters.maxMiles > 0) {
    const userCoords = zipToCoords(filters.zip.trim());
    if (userCoords) {
      const [userLat, userLng] = userCoords;
      result = result.filter((listing) => {
        const { lat, lng } = listing.seller;
        if (lat == null || lng == null) return false;
        const miles = distanceMiles(userLat, userLng, lat, lng);
        const withinRange = miles <= filters.maxMiles!;
        if (withinRange) return true;
        if (filters.includeShippable && listing.ships) return true;
        return false;
      });
    }
  }

  return result;
}
