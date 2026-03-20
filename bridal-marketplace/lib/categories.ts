import type { Category } from "@/types/listing";
import { categories } from "@/lib/mock/categories";

/** Top-level (parent) categories - no parentId */
export function getTopLevelCategories(): Category[] {
  return categories.filter((c) => !c.parentId);
}

/** Subcategories under a parent */
export function getSubcategories(parentId: string): Category[] {
  return categories.filter((c) => c.parentId === parentId);
}
