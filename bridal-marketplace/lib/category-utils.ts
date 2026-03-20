import type { Category } from "@/types/listing";
import { categories } from "@/lib/mock/categories";

/** Parent category if this is a subcategory. Safe for client components. */
export function getParentCategory(category: Category): Category | undefined {
  if (!category.parentId) return undefined;
  return categories.find((c) => c.id === category.parentId);
}
