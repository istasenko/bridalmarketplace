"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getTopLevelCategories, getSubcategories } from "@/lib/categories";
import { styles } from "@/lib/mock/styles";
import type { Listing, DeliveryOption, CreatorListingType } from "@/types/listing";

const RESELLER_CONDITIONS = ["like new", "gently used", "used"] as const;
const CREATOR_CONDITIONS = ["new", "like new", "gently used", "used"] as const;
const CREATOR_LISTING_TYPES: { value: CreatorListingType; label: string }[] = [
  { value: "handmade", label: "Handmade" },
  { value: "vintage", label: "Vintage" },
  { value: "craft_supplies", label: "Craft supplies" },
];
const DELIVERY_OPTIONS = [
  { value: "pickup_only" as const, label: "Pickup only" },
  { value: "ship_only" as const, label: "Ship only" },
  { value: "both" as const, label: "Both" },
];

type EditListingFormProps = {
  listing: Listing;
};

export default function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [madeToOrderChecked, setMadeToOrderChecked] = useState(listing.madeToOrder ?? false);

  const kind = listing.listingKind ?? "reselling";
  const conditions = kind === "creator" ? CREATOR_CONDITIONS : RESELLER_CONDITIONS;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      price: Number(formData.get("price")),
      condition: formData.get("condition") as string,
      categoryId: String(formData.get("categoryId") ?? "").trim(),
      styleIds: formData.getAll("styleIds") as string[],
      quantity: Number(formData.get("quantity")) || 1,
      deliveryOption: formData.get("deliveryOption") as DeliveryOption,
      listingKind: kind,
      imageUrls: listing.imageUrls,
    };

    if (kind === "creator") {
      const madeToOrder = formData.get("madeToOrder") === "on";
      Object.assign(payload, {
        creatorListingType: formData.get("creatorListingType") as CreatorListingType,
        madeToOrder,
        ...(madeToOrder && { leadTimeDays: Number(formData.get("leadTimeDays")) || 14 }),
      });
    }

    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update listing");
        return;
      }
      router.push(`/shops/${listing.sellerId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700">Photos</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {listing.imageUrls.map((url, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg bg-neutral-100">
              <Image
                src={url}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
                unoptimized
                sizes="80px"
              />
            </div>
          ))}
        </div>
        <p className="mt-1 text-xs text-neutral-500">Photos cannot be changed when editing.</p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={listing.title}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-neutral-700">
          Category *
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={listing.categoryId}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        >
          {getTopLevelCategories().map((parent) => {
            const subs = getSubcategories(parent.id);
            return (
              <optgroup key={parent.id} label={parent.name}>
                {subs.length > 0 ? (
                  subs.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))
                ) : (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                )}
              </optgroup>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Style *</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {styles.map((s) => (
            <label key={s.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="styleIds"
                value={s.id}
                defaultChecked={listing.styleIds.includes(s.id)}
                className="rounded border-neutral-300"
              />
              <span className="text-sm">{s.name}</span>
            </label>
          ))}
        </div>
      </div>

      {kind === "creator" && (
        <div>
          <label htmlFor="creatorListingType" className="block text-sm font-medium text-neutral-700">
            Listing type *
          </label>
          <select
            id="creatorListingType"
            name="creatorListingType"
            required
            defaultValue={listing.creatorListingType ?? ""}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          >
            {CREATOR_LISTING_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          defaultValue={listing.description}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-neutral-700">
            Price ($) *
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={listing.price}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-neutral-700">
            Condition *
          </label>
          <select
            id="condition"
            name="condition"
            required
            defaultValue={listing.condition}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          >
            {conditions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {kind === "creator" && (
        <div className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="madeToOrder"
              checked={madeToOrderChecked}
              onChange={(e) => setMadeToOrderChecked(e.target.checked)}
              className="rounded border-neutral-300"
            />
            <span className="text-sm font-medium text-neutral-700">Made to order</span>
          </label>
          {madeToOrderChecked && (
            <div className="pl-6">
              <label htmlFor="leadTimeDays" className="block text-sm text-neutral-600">
                Lead time (days) *
              </label>
              <input
                id="leadTimeDays"
                name="leadTimeDays"
                type="number"
                min="1"
                max="365"
                defaultValue={listing.leadTimeDays ?? 14}
                className="mt-1 block w-full max-w-[120px] rounded-md border border-neutral-300 px-3 py-2 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
            </div>
          )}
        </div>
      )}

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-neutral-700">
          Quantity
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          defaultValue={listing.quantity ?? 1}
          className="mt-1 block w-full max-w-[120px] rounded-md border border-neutral-300 px-3 py-2 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Delivery *</label>
        <div className="mt-2 flex flex-wrap gap-4">
          {DELIVERY_OPTIONS.map((o) => (
            <label key={o.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="deliveryOption"
                value={o.value}
                required
                defaultChecked={listing.deliveryOption === o.value}
                className="border-neutral-300"
              />
              <span className="text-sm">{o.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-neutral-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save changes"}
        </button>
        <Link
          href={listing.sellerId ? `/shops/${listing.sellerId}` : "/"}
          className="rounded-md border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
