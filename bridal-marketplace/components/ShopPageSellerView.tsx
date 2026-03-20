"use client";

import { useState } from "react";
import Link from "next/link";
import type { Shop } from "@/lib/shops-db";
import type { Listing, Category, Style } from "@/types/listing";
import type { SellerProfile } from "@/lib/profiles-db";
import SellerListingCard from "@/components/SellerListingCard";
import ShopEditForm from "@/components/ShopEditForm";

type ShopPageSellerViewProps = {
  shop: Shop;
  listings: Listing[];
  sellerProfile: SellerProfile | null;
  categories: Category[];
  styles: Style[];
};

export default function ShopPageSellerView({
  shop: initialShop,
  listings: initialListings,
  sellerProfile,
  categories,
  styles,
}: ShopPageSellerViewProps) {
  const [shop, setShop] = useState(initialShop);
  const [listings, setListings] = useState(initialListings);
  const [isEditing, setIsEditing] = useState(false);

  const handleDeleteListing = (listingId: string) => {
    setListings((prev) => prev.filter((l) => l.id !== listingId));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 rounded-lg border border-neutral-200 bg-neutral-50 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">{shop.shopName}</h1>
            {shop.shopDescription && (
              <p className="mt-2 text-neutral-700">{shop.shopDescription}</p>
            )}
            <p className="mt-2 text-sm text-neutral-500">Zip: {shop.zip}</p>
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Edit shop
            </button>
          ) : null}
        </div>

        {isEditing && (
          <ShopEditForm
            shop={shop}
            onSuccess={(updated) => {
              setShop(updated);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </div>

      <h2 className="mb-4 text-lg font-medium text-neutral-700">
        Your listings ({listings.length})
      </h2>
      {listings.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const cat = categories.find((c) => c.id === listing.categoryId);
            const styleNames = listing.styleIds
              .map((id) => styles.find((s) => s.id === id)?.name)
              .filter(Boolean) as string[];
            return (
              <SellerListingCard
                key={listing.id}
                listing={listing}
                categoryName={cat?.name ?? "Other"}
                styleNames={styleNames}
                onDelete={handleDeleteListing}
              />
            );
          })}
        </div>
      ) : (
        <p className="py-12 text-center text-neutral-500">
          No listings yet.{" "}
          <Link href="/sell" className="text-neutral-800 underline hover:no-underline">
            Create your first listing
          </Link>
        </p>
      )}
    </div>
  );
}
