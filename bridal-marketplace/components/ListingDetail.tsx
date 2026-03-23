import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/types/listing";
import { getCategories, getStyles } from "@/lib/listings";
import ContactSellerButton from "@/components/ContactSellerButton";

type ListingDetailProps = {
  listing: Listing;
  isOwner?: boolean;
};

export default function ListingDetail({ listing, isOwner = false }: ListingDetailProps) {
  const categories = getCategories();
  const allStyles = getStyles();
  const category = categories.find((c) => c.id === listing.categoryId);
  const listingStyles = listing.styleIds
    .map((id) => allStyles.find((s) => s.id === id)?.name)
    .filter(Boolean) as string[];

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-z-lg bg-blush-soft/50">
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
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)] md:text-3xl">
            {listing.title}
          </h1>
          <p className="mt-2 text-xl font-semibold text-accent">${listing.price}</p>
          <p className="mt-1 text-sm capitalize text-[var(--muted)]">{listing.condition}</p>
          {listing.listingKind === "creator" && listing.creatorListingType && (
            <span className="mt-2 inline-block rounded-z bg-sage px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-white">
              {listing.creatorListingType.replace("_", " ")}
            </span>
          )}
          {listing.madeToOrder && listing.leadTimeDays && (
            <p className="mt-2 text-sm text-[var(--muted)]">
              Made to order · Ready in {listing.leadTimeDays} days
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {category && (
              <span className="rounded-z bg-sage-light px-2.5 py-1 text-sm font-medium text-sage">
                {category.name}
              </span>
            )}
            {listingStyles.map((name) => (
              <span
                key={name}
                className="rounded-z bg-accent-light px-2.5 py-1 text-sm font-medium text-[#001e1d]"
              >
                {name}
              </span>
            ))}
          </div>
          <p className="mt-6 text-[var(--foreground)]">{listing.description}</p>
          <div className="mt-8 rounded-z-lg border border-[var(--border)] bg-surface/80 p-5">
            <p className="text-sm font-medium text-[var(--foreground)]">Seller</p>
            <p className="mt-1 font-medium text-[var(--foreground)]">{listing.seller.name}</p>
            <p className="text-sm text-[var(--muted)]">
              {listing.seller.location}
              {listing.seller.zip ? ` ${listing.seller.zip}` : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {listing.sellerId && (
                <Link
                  href={`/shops/${listing.sellerId}`}
                  className="rounded-z border border-pale-blue bg-surface px-4 py-2.5 text-sm font-medium text-pale-blue transition-colors hover:bg-pale-blue-soft"
                >
                  View shop
                </Link>
              )}
              <ContactSellerButton
                listingId={listing.id}
                email={listing.seller.contactEmail}
                shouldTrack={!isOwner}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
