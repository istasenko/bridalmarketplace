import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/types/listing";

type ListingCardProps = {
  listing: Listing;
  categoryName: string;
  styleNames: string[];
};

export default function ListingCard({ listing, categoryName, styleNames }: ListingCardProps) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <Image
          src={listing.imageUrls[0] ?? ""}
          alt={listing.title}
          fill
          className="object-cover transition group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-lg font-semibold text-neutral-800 group-hover:text-neutral-600">
          {listing.title}
        </p>
        <p className="mt-1 text-sm font-medium text-neutral-700">${listing.price}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
            {categoryName}
          </span>
          {styleNames.slice(0, 2).map((name) => (
            <span
              key={name}
              className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
            >
              {name}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          {listing.seller.location}
          {listing.seller.zip ? ` ${listing.seller.zip}` : ""}
        </p>
      </div>
    </Link>
  );
}
