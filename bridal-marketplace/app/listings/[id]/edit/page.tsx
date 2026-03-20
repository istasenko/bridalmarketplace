import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchListingByIdFromDb } from "@/lib/listings-db";
import { getCurrentUser } from "@/lib/auth";
import EditListingForm from "@/components/EditListingForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;
  const [listing, currentUser] = await Promise.all([
    fetchListingByIdFromDb(id),
    getCurrentUser(),
  ]);

  if (!listing || !listing.sellerId) notFound();
  if (!currentUser || currentUser.id !== listing.sellerId) notFound();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href={`/shops/${listing.sellerId}`}
          className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          ← Back to your shop
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-neutral-900">Edit listing</h1>
        <EditListingForm listing={listing} />
      </div>
    </div>
  );
}
