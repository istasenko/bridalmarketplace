"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");

  useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get("q") ?? "";
      const nextQ = searchQuery.trim();
      if (currentQ === nextQ) return;
      const params = new URLSearchParams(searchParams.toString());
      if (nextQ) params.set("q", nextQ);
      else params.delete("q");
      const qs = params.toString();
      router.replace(qs ? `${pathname || "/"}?${qs}` : pathname || "/", { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, pathname, router, searchParams]);

  const maxMilesParam = searchParams.get("maxMiles");
  const maxMiles =
    maxMilesParam && !isNaN(parseInt(maxMilesParam, 10))
      ? parseInt(maxMilesParam, 10)
      : undefined;
  const category = searchParams.get("category") || undefined;
  const style = searchParams.get("style") || undefined;
  const zip = searchParams.get("zip")?.trim() || undefined;
  const includeShippable = searchParams.get("ship") === "1";
  const queryTrimmed = searchQuery.trim() || undefined;

  const filtered = useMemo(() => {
    const filters: ListingFilters = {
      category,
      style,
      zip,
      maxMiles,
      includeShippable,
      query: queryTrimmed,
    };
    return applyListingFilters(listings, filters, categories, styles);
  }, [listings, categories, styles, category, style, zip, maxMiles, includeShippable, queryTrimmed]);

  return (
    <>
      <FilterBar
        categories={categories}
        styles={styles}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-heading mb-6 text-xl font-semibold text-[var(--muted)]">
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
          <p className="py-16 text-center text-[var(--muted)]">
            No listings match your filters. Try a different search, category, style, or distance.
          </p>
        )}
      </div>
    </>
  );
}
