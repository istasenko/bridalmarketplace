import Link from "next/link";
import { getListingById } from "@/lib/listings";
import { getCurrentUser } from "@/lib/auth";
import ListingDetail from "@/components/ListingDetail";
import ListingViewTracker from "@/components/ListingViewTracker";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingPage({ params }: PageProps) {
  const { id } = await params;
  const [listing, currentUser] = await Promise.all([
    getListingById(id),
    getCurrentUser(),
  ]);
  if (!listing) notFound();

  const isOwner = !!listing.sellerId && currentUser?.id === listing.sellerId;

  return (
    <div className="min-h-screen bg-white">
      <ListingViewTracker listingId={id} shouldTrack={!isOwner} />
      <div className="mx-auto max-w-4xl px-4 pt-4">
        <Link
          href={isOwner && listing.sellerId ? `/shops/${listing.sellerId}` : "/"}
          className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          ← {isOwner ? "Back to shop" : "Back to listings"}
        </Link>
      </div>
      <ListingDetail listing={listing} isOwner={isOwner} />
    </div>
  );
}
