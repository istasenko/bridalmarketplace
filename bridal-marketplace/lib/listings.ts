import type { Listing, ListingFilters } from "@/types/listing";
import { categories } from "@/lib/mock/categories";
import { styles } from "@/lib/mock/styles";
import { listings as mockListings } from "@/lib/mock/listings";
import { applyListingFilters } from "@/lib/filter-listings";
import { fetchListingsFromDb } from "@/lib/listings-db";

export function getCategories() {
  return categories;
}

export function getStyles() {
  return styles;
}

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  const dbListings = await fetchListingsFromDb();
  const merged = [...mockListings, ...dbListings];
  return applyListingFilters(merged, filters, categories, styles);
}

export async function getListingById(id: string): Promise<Listing | undefined> {
  const mock = mockListings.find((l) => l.id === id);
  if (mock) return mock;
  const dbListings = await fetchListingsFromDb();
  return dbListings.find((l) => l.id === id);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getStyleBySlug(slug: string) {
  return styles.find((s) => s.slug === slug);
}
