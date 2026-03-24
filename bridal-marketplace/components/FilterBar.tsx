"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category, Style } from "@/types/listing";

function getTopLevelCategories(categories: Category[]): Category[] {
  return categories.filter((c) => !c.parentId);
}

function getSubcategories(categories: Category[], parentId: string): Category[] {
  return categories.filter((c) => c.parentId === parentId);
}

const MAX_MILES_OPTIONS = [
  { value: "1", label: "1 mi" },
  { value: "5", label: "5 mi" },
  { value: "10", label: "10 mi" },
  { value: "25", label: "25+ mi" },
];

type FilterBarProps = {
  categories: Category[];
  styles: Style[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export default function FilterBar({ categories, styles, searchQuery, onSearchChange }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const style = searchParams.get("style") ?? "";
  const zip = searchParams.get("zip") ?? "";
  const maxMiles = searchParams.get("maxMiles") ?? "";

  const includeShippable = searchParams.get("ship") === "1";

  function updateFilters(updates: { category?: string; style?: string; zip?: string; maxMiles?: string; includeShippable?: boolean }) {
    const params = new URLSearchParams();
    const newCategory = updates.category !== undefined ? updates.category : category;
    const newStyle = updates.style !== undefined ? updates.style : style;
    const newZip = updates.zip !== undefined ? updates.zip : zip;
    const newMaxMiles = updates.maxMiles !== undefined ? updates.maxMiles : maxMiles;
    const newShip = updates.includeShippable !== undefined ? updates.includeShippable : includeShippable;
    if (newCategory) params.set("category", newCategory);
    if (newStyle) params.set("style", newStyle);
    if (newZip) params.set("zip", newZip);
    if (newMaxMiles) params.set("maxMiles", newMaxMiles);
    if (newShip) params.set("ship", "1");
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    const query = params.toString();
    const url = query ? `${pathname || "/"}?${query}` : pathname || "/";
    router.push(url);
  }

  return (
    <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-surface/95 py-5 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4">
        <div className="relative min-w-[min(100%,14rem)] flex-1 basis-full sm:basis-[16rem] sm:max-w-md">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" aria-hidden>
            🔍
          </span>
          <input
            id="marketplace-search"
            type="search"
            placeholder="Search listings…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-full border border-[var(--border)] bg-surface py-2 pl-9 pr-4 text-sm text-[var(--foreground)] focus:border-blush focus:outline-none focus:ring-2 focus:ring-blush/30"
            aria-label="Search marketplace"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="category" className="text-sm font-medium text-[var(--muted)]">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="rounded-z border border-[var(--border)] bg-surface px-3 py-2 text-sm text-[var(--foreground)] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All</option>
            {getTopLevelCategories(categories).flatMap((parent) => {
              const subs = getSubcategories(categories, parent.id);
              return [
                <option key={parent.id} value={parent.slug}>
                  {parent.name}
                </option>,
                ...subs.map((sub) => (
                  <option key={sub.id} value={sub.slug}>
                    {"\u00A0\u00A0"}
                    {sub.name}
                  </option>
                )),
              ];
            })}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--muted)]">Style</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateFilters({ style: "" })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!style ? "bg-butter text-[#001e1d] hover:bg-mint active:bg-mint" : "bg-mint-soft text-[var(--foreground)] hover:bg-mint"}`}
            >
              All
            </button>
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => updateFilters({ style: s.slug })}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${style === s.slug ? "bg-butter text-[#001e1d] hover:bg-mint active:bg-mint" : "bg-mint-soft text-[var(--foreground)] hover:bg-mint"}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-l border-[var(--border)] pl-4">
          <label htmlFor="zip" className="text-sm font-medium text-[var(--muted)]">
            Your zip
          </label>
          <input
            id="zip"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 10001"
            maxLength={5}
            value={zip}
            onChange={(e) => updateFilters({ zip: e.target.value.replace(/\D/g, "").slice(0, 5) })}
            className="w-20 rounded-z border border-[var(--border)] bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          {maxMiles && !zip && (
            <span className="text-xs text-blush">Enter zip to filter by distance</span>
          )}
          <label htmlFor="maxMiles" className="text-sm font-medium text-[var(--muted)]">
            Max miles
          </label>
          <select
            id="maxMiles"
            value={maxMiles}
            onChange={(e) => updateFilters({ maxMiles: e.target.value })}
            className="rounded-z border border-[var(--border)] bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">Any</option>
            {MAX_MILES_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={includeShippable}
              onChange={(e) => updateFilters({ includeShippable: e.target.checked })}
              className="h-4 w-4 rounded border-[var(--border)] text-accent focus:ring-accent/50"
            />
            <span className="text-sm text-[var(--muted)]">Also show shippable items (adds listings outside your range)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
