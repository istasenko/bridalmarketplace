import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchShopBySellerId } from "@/lib/shops-db";
import { fetchListingsBySellerId } from "@/lib/listings-db";
import { fetchSellerProfile } from "@/lib/profiles-db";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getStyles } from "@/lib/listings";
import ShopPageBuyerView from "@/components/ShopPageBuyerView";
import ShopPageSellerView from "@/components/ShopPageSellerView";

type PageProps = {
  params: Promise<{ sellerId: string }>;
};

export default async function ShopPage({ params }: PageProps) {
  const { sellerId } = await params;
  const [shop, listings, sellerProfile, currentUser] = await Promise.all([
    fetchShopBySellerId(sellerId),
    fetchListingsBySellerId(sellerId),
    fetchSellerProfile(sellerId),
    getCurrentUser(),
  ]);

  if (!shop) notFound();

  const isOwner = currentUser?.id === sellerId;
  const categories = getCategories();
  const styles = getStyles();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <Link
          href="/"
          className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          ← Keep shopping
        </Link>
      </div>
      {isOwner ? (
        <ShopPageSellerView
          shop={shop}
          listings={listings}
          sellerProfile={sellerProfile}
          categories={categories}
          styles={styles}
        />
      ) : (
        <ShopPageBuyerView
          shop={shop}
          listings={listings}
          sellerProfile={sellerProfile}
          categories={categories}
          styles={styles}
        />
      )}
    </div>
  );
}
