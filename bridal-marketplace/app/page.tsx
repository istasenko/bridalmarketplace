import { unstable_noStore } from "next/cache";
import { Suspense } from "react";
import { getCategories, getStyles, getListings } from "@/lib/listings";
import MarketplaceContent from "@/components/MarketplaceContent";

// Fetch fresh listings on each visit so new listings appear immediately
export const dynamic = "force-dynamic";

export default async function HomePage() {
  unstable_noStore();
  const categories = getCategories();
  const styles = getStyles();
  const allListings = await getListings({});

  return (
    <Suspense
      fallback={
        <div className="border-b border-neutral-200 bg-white py-4">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="h-8 w-32 animate-pulse rounded bg-neutral-200" />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-neutral-200" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <MarketplaceContent
        listings={allListings}
        categories={categories}
        styles={styles}
      />
    </Suspense>
  );
}
