import Image from "next/image";
import type { Shop } from "@/lib/shops-db";

type ShopHeaderProps = {
  shop: Shop;
  sellerEmail: string | null;
  isOwner?: boolean;
  onEditClick?: () => void;
};

function formatShopAge(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  const months = Math.max(0, Math.floor((now.getTime() - created.getTime()) / (30 * 24 * 60 * 60 * 1000)));
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} on Ever After`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} on Ever After`;
}

export default function ShopHeader({
  shop,
  sellerEmail,
  isOwner,
  onEditClick,
}: ShopHeaderProps) {
  const shopAge = formatShopAge(shop.createdAt);

  return (
    <div className="flex flex-wrap items-start justify-between gap-6 border-b border-neutral-200 pb-6">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-200">
          {shop.avatarUrl ? (
            <Image
              src={shop.avatarUrl}
              alt=""
              width={80}
              height={80}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-neutral-500">
              {shop.shopName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{shop.shopName}</h1>
          <p className="mt-1 text-sm text-neutral-600">
            NYC Metro • Zip {shop.zip}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              <span aria-hidden>★</span> No reviews yet
            </span>
            <span>{shopAge}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {!isOwner && sellerEmail && (
          <>
            <a
              href={`mailto:${sellerEmail}`}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <span aria-hidden>✉</span> Contact
            </a>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <span aria-hidden>♡</span> Follow
            </button>
          </>
        )}
        {isOwner && onEditClick && (
          <button
            type="button"
            onClick={onEditClick}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Edit shop
          </button>
        )}
      </div>
    </div>
  );
}
