"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Shop } from "@/lib/shops-db";
import type { Listing, Category, Style } from "@/types/listing";
import type { SellerProfile } from "@/lib/profiles-db";
import ShopHeader from "@/components/ShopHeader";
import { getParentCategory } from "@/lib/category-utils";

type ShopPageBuyerViewProps = {
  shop: Shop;
  listings: Listing[];
  sellerProfile: SellerProfile | null;
  categories: Category[];
  styles: Style[];
};

type TabId = "items" | "reviews" | "about" | "policies";

export default function ShopPageBuyerView({
  shop,
  listings,
  sellerProfile,
  categories,
  styles,
}: ShopPageBuyerViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("items");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "newest" | "price-low" | "price-high">("relevance");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: listings.length };
    listings.forEach((l) => {
      const cat = categories.find((c) => c.id === l.categoryId);
      const parent = cat ? getParentCategory(cat) ?? cat : null;
      const key = parent?.name ?? cat?.name ?? "Other";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
  }, [listings, categories]);

  const filteredListings = useMemo(() => {
    let result = [...listings];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (categories.find((c) => c.id === l.categoryId)?.name ?? "").toLowerCase().includes(q) ||
          l.styleIds.some(
            (id) => styles.find((s) => s.id === id)?.name.toLowerCase().includes(q)
          )
      );
    }
    if (selectedCategoryId) {
      const cat = categories.find((c) => c.id === selectedCategoryId);
      const parent = cat ? getParentCategory(cat) ?? cat : null;
      const matchIds = parent
        ? categories.filter((c) => c.parentId === parent.id || c.id === parent.id).map((c) => c.id)
        : [selectedCategoryId];
      result = result.filter((l) => matchIds.includes(l.categoryId));
    }
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }
    return result;
  }, [listings, searchQuery, selectedCategoryId, sortBy, categories, styles]);

  const uniqueCategoryGroups = useMemo(() => {
    const groupCounts: Record<string, { id: string; name: string; count: number }> = {};
    listings.forEach((l) => {
      const cat = categories.find((c) => c.id === l.categoryId);
      const parent = cat ? (getParentCategory(cat) ?? cat) : null;
      const id = parent?.id ?? cat?.id ?? "other";
      const name = parent?.name ?? cat?.name ?? "Other";
      if (!groupCounts[id]) groupCounts[id] = { id, name, count: 0 };
      groupCounts[id].count += 1;
    });
    return Object.values(groupCounts).sort((a, b) => b.count - a.count);
  }, [listings, categories]);

  const totalContacts = listings.reduce((sum, l) => sum + (l.contactCount ?? 0), 0);

  const tabs: { id: TabId; label: string }[] = [
    { id: "items", label: "Items" },
    { id: "reviews", label: "Reviews" },
    { id: "about", label: "About" },
    { id: "policies", label: "Shop Policies" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ShopHeader shop={shop} sellerEmail={sellerProfile?.email ?? null} />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex gap-6 border-b border-neutral-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        {activeTab === "items" && (
          <div className="relative shrink-0 sm:w-64">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden>🔍</span>
            <input
              type="search"
              placeholder={`Search all ${listings.length} items`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-neutral-300 bg-white py-2 pl-9 pr-4 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              aria-label="Search shop items"
            />
          </div>
        )}
      </div>

      {activeTab === "items" && (
        <div className="mt-8 flex gap-8">
          <aside className="w-56 shrink-0">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(null)}
                    className={`block w-full text-left text-sm ${selectedCategoryId ? "text-neutral-600 hover:text-neutral-900" : "font-medium text-neutral-900"}`}
                  >
                    All ({categoryCounts.All})
                  </button>
                </li>
                {uniqueCategoryGroups.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryId(selectedCategoryId === g.id ? null : g.id)}
                      className={`block w-full text-left text-sm lowercase first:capitalize ${selectedCategoryId === g.id ? "font-medium text-neutral-900" : "text-neutral-600 hover:text-neutral-900"}`}
                    >
                      {g.name} ({g.count})
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-neutral-200 pt-4">
                <a
                  href={sellerProfile?.email ? `mailto:${sellerProfile.email}?subject=Custom order request` : "#"}
                  className="mb-2 block w-full rounded-md bg-neutral-800 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-neutral-700"
                >
                  Request custom order
                </a>
                <a
                  href={sellerProfile?.email ? `mailto:${sellerProfile.email}` : "#"}
                  className="block w-full rounded-md border border-neutral-300 px-4 py-2.5 text-center text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Contact shop owner
                </a>
              </div>
              <p className="text-xs text-neutral-500">
                {totalContacts} contact{totalContacts !== 1 ? "s" : ""}
              </p>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">
                {filteredListings.length} item{filteredListings.length !== 1 ? "s" : ""}
              </h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="newest">Sort: Newest</option>
                <option value="price-low">Sort: Price low to high</option>
                <option value="price-high">Sort: Price high to low</option>
              </select>
            </div>
            {filteredListings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredListings.map((listing) => {
                  const cat = categories.find((c) => c.id === listing.categoryId);
                  const deliveryLabel =
                    listing.deliveryOption === "pickup_only"
                      ? "Pickup only"
                      : listing.deliveryOption === "ship_only"
                        ? "Ships"
                        : "Pickup or ships";
                  return (
                    <Link
                      key={listing.id}
                      href={`/listings/${listing.id}`}
                      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                        <Image
                          src={listing.imageUrls[0] ?? ""}
                          alt={listing.title}
                          fill
                          className="object-cover transition group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-3">
                        <p className="line-clamp-2 text-sm font-medium text-neutral-800 group-hover:text-neutral-600">
                          {listing.title}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-neutral-900">${listing.price}</p>
                        <p className="mt-0.5 text-xs text-neutral-500">{deliveryLabel}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="py-12 text-center text-neutral-500">
                No items match your search. Try a different filter or search term.
              </p>
            )}
          </main>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-12 text-center">
          <p className="text-neutral-600">No reviews yet.</p>
        </div>
      )}

      {activeTab === "about" && (
        <div className="mt-8 space-y-4">
          {shop.shopDescription ? (
            <p className="text-neutral-700">{shop.shopDescription}</p>
          ) : (
            <p className="text-neutral-500">This shop hasn&apos;t added an about section yet.</p>
          )}
        </div>
      )}

      {activeTab === "policies" && (
        <div className="mt-8">
          {shop.shopPolicies ? (
            <div className="whitespace-pre-wrap text-neutral-700">{shop.shopPolicies}</div>
          ) : (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-12 text-center">
              <p className="text-neutral-600">This shop hasn&apos;t added policies yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
