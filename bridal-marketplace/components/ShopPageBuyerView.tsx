import Link from "next/link";
import type { Shop } from "@/lib/shops-db";
import type { Listing, Category, Style } from "@/types/listing";
import type { SellerProfile } from "@/lib/profiles-db";
import ListingCard from "@/components/ListingCard";

type ShopPageBuyerViewProps = {
  shop: Shop;
  listings: Listing[];
  sellerProfile: SellerProfile | null;
  categories: Category[];
  styles: Style[];
};

export default function ShopPageBuyerView({
  shop,
  listings,
  sellerProfile,
  categories,
  styles,
}: ShopPageBuyerViewProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 rounded-lg border border-neutral-200 bg-neutral-50 p-6">
        <h1 className="text-2xl font-semibold text-neutral-900">{shop.shopName}</h1>
        {shop.shopDescription && (
          <p className="mt-2 text-neutral-700">{shop.shopDescription}</p>
        )}
        <p className="mt-2 text-sm text-neutral-500">Zip: {shop.zip}</p>
        {sellerProfile && (
          <a
            href={`mailto:${sellerProfile.email}`}
            className="mt-4 inline-block rounded-md bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Contact seller
          </a>
        )}
      </div>

      <h2 className="mb-4 text-lg font-medium text-neutral-700">
        {listings.length} listing{listings.length !== 1 ? "s" : ""}
      </h2>
      {listings.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
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
      ) : (
        <p className="py-12 text-center text-neutral-500">No listings yet.</p>
      )}
    </div>
  );
}
