"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageUpload } from "@/components/ImageUpload";
import type { ImageUploadRef } from "@/components/ImageUpload";
import { styles } from "@/lib/mock/styles";
import { getTopLevelCategories, getSubcategories } from "@/lib/categories";
import type { DeliveryOption, ListingKind, CreatorListingType } from "@/types/listing";

const RESELLER_CONDITIONS = ["like new", "gently used", "used"] as const;
const CREATOR_CONDITIONS = ["new", "like new", "gently used", "used"] as const;
const CREATOR_LISTING_TYPES: { value: CreatorListingType; label: string }[] = [
  { value: "handmade", label: "Handmade" },
  { value: "vintage", label: "Vintage" },
  { value: "craft_supplies", label: "Craft supplies" },
];
const DELIVERY_OPTIONS: { value: DeliveryOption; label: string }[] = [
  { value: "pickup_only", label: "Pickup only" },
  { value: "ship_only", label: "Ship only" },
  { value: "both", label: "Both" },
];

type ListingKindStepProps = {
  onSelect: (kind: ListingKind) => void;
};

function ListingKindStep({ onSelect }: ListingKindStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-neutral-700">What are you listing?</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("reselling")}
          className="flex flex-col rounded-lg border-2 border-neutral-200 bg-white p-6 text-left transition-colors hover:border-neutral-400 hover:bg-neutral-50"
        >
          <span className="font-semibold text-neutral-900">Pre-owned item (reselling)</span>
          <span className="mt-2 text-sm text-neutral-600">
            Something you used or no longer need — table numbers, centerpieces, favors, etc.
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSelect("creator")}
          className="flex flex-col rounded-lg border-2 border-neutral-200 bg-white p-6 text-left transition-colors hover:border-neutral-400 hover:bg-neutral-50"
        >
          <span className="font-semibold text-neutral-900">
            Something I created (handmade, vintage, supplies)
          </span>
          <span className="mt-2 text-sm text-neutral-600">
            Items you made, vintage finds, or craft supplies for DIY brides.
          </span>
        </button>
      </div>
    </div>
  );
}

export default function CreateListingForm() {
  const router = useRouter();
  const imageUploadRef = useRef<ImageUploadRef>(null);
  const submitLockRef = useRef(false);
  const [listingKind, setListingKind] = useState<ListingKind | null>(null);
  const [madeToOrderChecked, setMadeToOrderChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitLockRef.current) return;
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const kind = (listingKind ?? "reselling") as ListingKind;
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const price = Number(formData.get("price"));
    const condition = formData.get("condition") as string;
    const categoryId = String(formData.get("categoryId") ?? "").trim();
    const styleIds = formData.getAll("styleIds") as string[];
    const quantity = Number(formData.get("quantity")) || 1;
    const deliveryOption = formData.get("deliveryOption") as DeliveryOption;
    const creatorListingType = formData.get("creatorListingType") as CreatorListingType | "";
    const madeToOrder = kind === "creator" && formData.get("madeToOrder") === "on";
    const leadTimeDays = Number(formData.get("leadTimeDays")) || 0;

    if (!title) {
      setError("Title is required");
      return;
    }
    if (!description) {
      setError("Description is required");
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      setError("Valid price is required");
      return;
    }
    const validConditions = kind === "creator" ? CREATOR_CONDITIONS : RESELLER_CONDITIONS;
    if (!condition || !(validConditions as readonly string[]).includes(condition)) {
      setError("Condition is required");
      return;
    }
    if (kind === "creator" && !creatorListingType) {
      setError("Listing type (handmade/vintage/supplies) is required");
      return;
    }
    if (kind === "creator" && madeToOrder && (leadTimeDays < 1 || leadTimeDays > 365)) {
      setError("Lead time must be between 1 and 365 days");
      return;
    }
    if (!categoryId) {
      setError("Category is required");
      return;
    }
    if (!styleIds.length) {
      setError("Select at least one style");
      return;
    }
    if (!deliveryOption || !DELIVERY_OPTIONS.some((o) => o.value === deliveryOption)) {
      setError("Delivery option is required");
      return;
    }

    const files = imageUploadRef.current?.getFiles() ?? [];
    if (files.length === 0) {
      setError("At least one photo is required");
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    try {
      const imageUrls = await imageUploadRef.current!.upload();
      const payload: Record<string, unknown> = {
        title,
        description,
        price,
        condition,
        categoryId,
        styleIds,
        imageUrls,
        quantity,
        deliveryOption,
        listingKind: kind,
      };
      if (kind === "creator") {
        payload.creatorListingType = creatorListingType;
        payload.madeToOrder = madeToOrder;
        if (madeToOrder) payload.leadTimeDays = leadTimeDays;
      }
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create listing");
        return;
      }
      router.push(`/listings/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
  };

  if (listingKind === null) {
    return (
      <div>
        <ListingKindStep onSelect={setListingKind} />
        <Link
          href="/"
          className="mt-8 inline-block text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          ← Keep shopping
        </Link>
      </div>
    );
  }

  const conditions = listingKind === "creator" ? CREATOR_CONDITIONS : RESELLER_CONDITIONS;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
        <span className="text-sm text-neutral-600">
          Listing as: {listingKind === "creator" ? "Creator" : "Reseller"}
        </span>
        <button
          type="button"
          onClick={() => setListingKind(null)}
          className="text-sm text-neutral-500 underline hover:text-neutral-700"
        >
          Change
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          placeholder={
            listingKind === "creator"
              ? "e.g. Hand-painted Welcome Sign"
              : "e.g. Acrylic Table Numbers 1–20"
          }
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
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        >
          <option value="">Select category</option>
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
                className="rounded border-neutral-300"
              />
              <span className="text-sm">{s.name}</span>
            </label>
          ))}
        </div>
      </div>

      {listingKind === "creator" && (
        <div>
          <label htmlFor="creatorListingType" className="block text-sm font-medium text-neutral-700">
            Listing type *
          </label>
          <select
            id="creatorListingType"
            name="creatorListingType"
            required
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          >
            <option value="">Select type</option>
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
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          placeholder="Describe your item..."
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
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
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
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          >
            <option value="">Select</option>
            {conditions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {listingKind === "creator" && (
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
                required={madeToOrderChecked}
                className="mt-1 block w-full max-w-[120px] rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
              <p className="mt-1 text-xs text-neutral-500">
                How many days until the item is ready to ship or pickup
              </p>
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
          defaultValue="1"
          className="mt-1 block w-full max-w-[120px] rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Delivery *
        </label>
        <div className="mt-2 flex flex-wrap gap-4">
          {DELIVERY_OPTIONS.map((o) => (
            <label key={o.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="deliveryOption"
                value={o.value}
                required
                className="border-neutral-300"
              />
              <span className="text-sm">{o.label}</span>
            </label>
          ))}
        </div>
      </div>

      <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
        Your contact info and location will be taken from your shop profile.
      </p>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Photos *</label>
        <ImageUpload ref={imageUploadRef} />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-neutral-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create listing"}
        </button>
        <Link
          href="/"
          className="rounded-md border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
