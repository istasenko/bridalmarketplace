import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/types/listing";

type ListingCardProps = {
  listing: Listing;
  categoryName: string;
  styleNames: string[];
};

export default function ListingCard({ listing, categoryName, styleNames }: ListingCardProps) {
  const sellerLocation = listing.seller.location + (listing.seller.zip ? ` ${listing.seller.zip}` : "");

  return (
    <div className="group flex flex-col overflow-hidden rounded-z-lg border border-[var(--border)] bg-surface shadow-z transition-all duration-300 hover:shadow-z-hover">
      <Link href={`/listings/${listing.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-z-lg bg-blush-soft/30">
          <Image
            src={listing.imageUrls[0] ?? ""}
            alt={listing.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="font-heading text-lg font-semibold text-[var(--foreground)] transition-colors group-hover:text-accent">
            {listing.title}
          </p>
          <p className="mt-1 text-sm font-semibold text-accent">${listing.price}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-z bg-sage-light px-2.5 py-0.5 text-xs font-medium text-sage">
              {categoryName}
            </span>
            {styleNames.slice(0, 1).map((name) => (
              <span
                key={name}
                className="rounded-z bg-accent-light px-2.5 py-0.5 text-xs font-medium text-[#001e1d]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </Link>
      <div className="border-t border-[var(--border)] px-4 py-2.5">
        {listing.sellerId ? (
          <Link
            href={`/shops/${listing.sellerId}`}
            className="text-xs text-[var(--muted)] transition-colors hover:text-accent hover:underline"
          >
            {sellerLocation}
          </Link>
        ) : (
          <p className="text-xs text-[var(--muted)]">{sellerLocation}</p>
        )}
      </div>
    </div>
  );
}
