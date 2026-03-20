import type { Listing, ListingFilters, Category } from "@/types/listing";
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

/** Top-level (parent) categories - no parentId */
export function getTopLevelCategories(): Category[] {
  return categories.filter((c) => !c.parentId);
}

/** Subcategories under a parent */
export function getSubcategories(parentId: string): Category[] {
  return categories.filter((c) => c.parentId === parentId);
}

/** Find category by id; returns undefined if not found (e.g. orphaned DB listing) */
export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

/** Parent category if this is a subcategory */
export function getParentCategory(category: Category): Category | undefined {
  if (!category.parentId) return undefined;
  return categories.find((c) => c.id === category.parentId);
}

/** All category IDs that match a filter slug (parent = self + all descendants; sub = self) */
export function getCategoryIdsForFilter(slug: string): string[] {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return [];
  if (!cat.parentId) {
    const subs = getSubcategories(cat.id);
    return subs.length > 0 ? subs.map((s) => s.id) : [cat.id];
  }
  return [cat.id];
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
