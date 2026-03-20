"use client";

import { useEffect } from "react";

type ListingViewTrackerProps = {
  listingId: string;
  shouldTrack: boolean;
};

export default function ListingViewTracker({ listingId, shouldTrack }: ListingViewTrackerProps) {
  useEffect(() => {
    if (!shouldTrack) return;
    fetch(`/api/listings/${listingId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "view" }),
      credentials: "include",
    }).catch(() => {});
  }, [listingId, shouldTrack]);

  return null;
}
