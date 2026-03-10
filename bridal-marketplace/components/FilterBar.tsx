"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category, Style } from "@/types/listing";

const MAX_MILES_OPTIONS = [
  { value: "1", label: "1 mi" },
  { value: "5", label: "5 mi" },
  { value: "10", label: "10 mi" },
  { value: "25", label: "25+ mi" },
];

type FilterBarProps = {
  categories: Category[];
  styles: Style[];
};

export default function FilterBar({ categories, styles }: FilterBarProps) {
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
    const query = params.toString();
    const url = query ? `${pathname || "/"}?${query}` : pathname || "/";
    router.push(url);
  }

  return (
    <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <label htmlFor="category" className="text-sm font-medium text-neutral-600">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-600">Style</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateFilters({ style: "" })}
              className={`rounded-full px-3 py-1.5 text-sm ${!style ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
            >
              All
            </button>
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => updateFilters({ style: s.slug })}
                className={`rounded-full px-3 py-1.5 text-sm ${style === s.slug ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-l border-neutral-200 pl-4">
          <label htmlFor="zip" className="text-sm font-medium text-neutral-600">
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
            className="w-20 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          {maxMiles && !zip && (
            <span className="text-xs text-amber-600">Enter zip to filter by distance</span>
          )}
          <label htmlFor="maxMiles" className="text-sm font-medium text-neutral-600">
            Max miles
          </label>
          <select
            id="maxMiles"
            value={maxMiles}
            onChange={(e) => updateFilters({ maxMiles: e.target.value })}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
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
              className="h-4 w-4 rounded border-neutral-300 text-neutral-800 focus:ring-neutral-500"
            />
            <span className="text-sm text-neutral-600">Also show shippable items (adds listings outside your range)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
