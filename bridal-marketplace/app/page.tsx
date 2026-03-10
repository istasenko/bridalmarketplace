import { Suspense } from "react";
import { getCategories, getStyles, getListings } from "@/lib/listings";
import MarketplaceContent from "@/components/MarketplaceContent";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categories = getCategories();
  const styles = getStyles();
  const allListings = await getListings({});

  const filterCategory = typeof params.category === "string" ? params.category : undefined;
  const filterStyle = typeof params.style === "string" ? params.style : undefined;
  const filterZip = typeof params.zip === "string" ? params.zip : undefined;
  const maxMilesParam = typeof params.maxMiles === "string" ? params.maxMiles : undefined;
  const filterMaxMiles =
    maxMilesParam && !isNaN(parseInt(maxMilesParam, 10))
      ? parseInt(maxMilesParam, 10)
      : undefined;
  const filterIncludeShippable = params.ship === "1";

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
        initialFilters={{
          category: filterCategory,
          style: filterStyle,
          zip: filterZip,
          maxMiles: filterMaxMiles,
          includeShippable: filterIncludeShippable,
        }}
      />
    </Suspense>
  );
}
