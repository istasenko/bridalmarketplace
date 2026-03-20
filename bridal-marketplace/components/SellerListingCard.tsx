"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/types/listing";

type SellerListingCardProps = {
  listing: Listing;
  categoryName: string;
  styleNames: string[];
  onDelete: (listingId: string) => void;
};

export default function SellerListingCard({
  listing,
  categoryName,
  styleNames,
  onDelete,
}: SellerListingCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        onDelete(listing.id);
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to delete");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <Link href={`/listings/${listing.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
          <Image
            src={listing.imageUrls[0] ?? ""}
            alt={listing.title}
            fill
            className="object-cover transition hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="text-lg font-semibold text-neutral-800">{listing.title}</p>
          <p className="mt-1 text-sm font-medium text-neutral-700">${listing.price}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
            <span title="Views">
              {listing.viewCount ?? 0} view{(listing.viewCount ?? 0) !== 1 ? "s" : ""}
            </span>
            <span title="Contact clicks">
              {listing.contactCount ?? 0} contact{(listing.contactCount ?? 0) !== 1 ? "s" : ""}
            </span>
          </div>
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
        </div>
      </Link>
      <div className="flex gap-2 border-t border-neutral-100 p-4">
        <Link
          href={`/listings/${listing.id}/edit`}
          className="flex-1 rounded-md border border-neutral-300 py-2 text-center text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className={`flex-1 rounded-md py-2 text-center text-sm font-medium ${
            showConfirm
              ? "bg-red-600 text-white hover:bg-red-700"
              : "border border-red-200 text-red-700 hover:bg-red-50"
          } disabled:opacity-50`}
        >
          {deleting ? "Deleting..." : showConfirm ? "Confirm delete?" : "Delete"}
        </button>
      </div>
    </div>
  );
}
