import type { Listing, ListingFilters, Category, Style } from "@/types/listing";
import { zipToCoords, distanceMiles } from "@/lib/geo";

/** Resolve category slug to matching listing categoryIds (parent = all subcategories) */
function getCategoryIdsForFilter(slug: string, categories: Category[]): string[] {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return [];
  if (!cat.parentId) {
    const subs = categories.filter((c) => c.parentId === cat!.id);
    return subs.length > 0 ? subs.map((s) => s.id) : [cat.id];
  }
  return [cat.id];
}

function listingMatchesQuery(
  listing: Listing,
  q: string,
  categories: Category[],
  styles: Style[]
): boolean {
  const needle = q.toLowerCase();
  if (listing.title.toLowerCase().includes(needle)) return true;
  if (listing.description.toLowerCase().includes(needle)) return true;
  if (listing.condition.toLowerCase().includes(needle)) return true;
  if (listing.seller.name.toLowerCase().includes(needle)) return true;
  if (listing.seller.location.toLowerCase().includes(needle)) return true;
  const zip = listing.seller.zip?.toLowerCase();
  if (zip && zip.includes(needle)) return true;

  const cat = categories.find((c) => c.id === listing.categoryId);
  if (cat) {
    if (cat.name.toLowerCase().includes(needle)) return true;
    const parent = cat.parentId ? categories.find((c) => c.id === cat.parentId) : undefined;
    if (parent?.name.toLowerCase().includes(needle)) return true;
  }

  return listing.styleIds.some((id) => {
    const style = styles.find((s) => s.id === id);
    return style?.name.toLowerCase().includes(needle);
  });
}

/**
 * Pure filter function: same logic as getListings but works with any listing array.
 * Used for client-side filtering so the list updates immediately when params change.
 * Category filter supports both parent slugs (matches all subcategories) and subcategory slugs.
 */
export function applyListingFilters(
  listings: Listing[],
  filters: ListingFilters,
  categories: Category[],
  styles: Style[]
): Listing[] {
  let result = [...listings];

  if (filters.category) {
    const matchingIds = getCategoryIdsForFilter(filters.category, categories);
    if (matchingIds.length > 0) {
      result = result.filter((l) => matchingIds.includes(l.categoryId));
    }
  }

  if (filters.style) {
    const style = styles.find((s) => s.slug === filters.style);
    if (style) {
      result = result.filter((l) => l.styleIds.includes(style.id));
    }
  }

  const textQ = filters.query?.trim();
  if (textQ) {
    result = result.filter((l) => listingMatchesQuery(l, textQ, categories, styles));
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
