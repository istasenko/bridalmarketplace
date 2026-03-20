import Image from "next/image";
import type { Listing } from "@/types/listing";
import { getCategories, getStyles } from "@/lib/listings";

type ListingDetailProps = {
  listing: Listing;
};

export default function ListingDetail({ listing }: ListingDetailProps) {
  const categories = getCategories();
  const allStyles = getStyles();
  const category = categories.find((c) => c.id === listing.categoryId);
  const listingStyles = listing.styleIds
    .map((id) => allStyles.find((s) => s.id === id)?.name)
    .filter(Boolean) as string[];

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
          <Image
            src={listing.imageUrls[0] ?? ""}
            alt={listing.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
            {listing.title}
          </h1>
          <p className="mt-2 text-xl font-medium text-neutral-800">${listing.price}</p>
          <p className="mt-1 text-sm capitalize text-neutral-500">{listing.condition}</p>
          {listing.listingKind === "creator" && listing.creatorListingType && (
            <span className="mt-2 inline-block rounded bg-neutral-800 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-white">
              {listing.creatorListingType.replace("_", " ")}
            </span>
          )}
          {listing.madeToOrder && listing.leadTimeDays && (
            <p className="mt-2 text-sm text-neutral-600">
              Made to order · Ready in {listing.leadTimeDays} days
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {category && (
              <span className="rounded bg-neutral-200 px-2.5 py-1 text-sm text-neutral-700">
                {category.name}
              </span>
            )}
            {listingStyles.map((name) => (
              <span
                key={name}
                className="rounded bg-neutral-200 px-2.5 py-1 text-sm text-neutral-700"
              >
                {name}
              </span>
            ))}
          </div>
          <p className="mt-6 text-neutral-700">{listing.description}</p>
          <div className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-medium text-neutral-800">Seller</p>
            <p className="mt-1 text-neutral-700">{listing.seller.name}</p>
            <p className="text-sm text-neutral-500">
              {listing.seller.location}
              {listing.seller.zip ? ` ${listing.seller.zip}` : ""}
            </p>
            <a
              href={`mailto:${listing.seller.contactEmail}`}
              className="mt-4 inline-block rounded-md bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
            >
              Contact seller
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
