"use client";

import { useSearchParams } from "next/navigation";
import type { Listing, Category, Style, ListingFilters } from "@/types/listing";
import { applyListingFilters } from "@/lib/filter-listings";
import FilterBar from "@/components/FilterBar";
import ListingCard from "@/components/ListingCard";

type MarketplaceContentProps = {
  listings: Listing[];
  categories: Category[];
  styles: Style[];
};

export default function MarketplaceContent({
  listings,
  categories,
  styles,
}: MarketplaceContentProps) {
  const searchParams = useSearchParams();
  const maxMilesParam = searchParams.get("maxMiles");
  const maxMiles =
    maxMilesParam && !isNaN(parseInt(maxMilesParam, 10))
      ? parseInt(maxMilesParam, 10)
      : undefined;
  const filters: ListingFilters = {
    category: searchParams.get("category") || undefined,
    style: searchParams.get("style") || undefined,
    zip: searchParams.get("zip")?.trim() || undefined,
    maxMiles,
    includeShippable: searchParams.get("ship") === "1",
  };

  const filtered = applyListingFilters(listings, filters, categories, styles);

  return (
    <>
      <FilterBar categories={categories} styles={styles} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-6 text-lg font-medium text-neutral-600">
          {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => {
            const cat = categories.find((c) => c.id === listing.categoryId);
            const styleNames = listing.styleIds
              .map((id) => styles.find((s) => s.id === id)?.name)
              .filter(Boolean) as string[];
            return (
              <ListingCard
                key={listing.id}
                listing={listing}
                categoryName={cat?.name ?? "Other"}
                styleNames={styleNames}
              />
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-neutral-500">
            No listings match your filters. Try changing category, style, or distance.
          </p>
        )}
      </div>
    </>
  );
}
