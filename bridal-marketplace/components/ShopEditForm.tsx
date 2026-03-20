"use client";

import { useState } from "react";
import type { Shop } from "@/lib/shops-db";

type ShopEditFormProps = {
  shop: Shop;
  onSuccess: (updated: Shop) => void;
  onCancel: () => void;
};

export default function ShopEditForm({ shop, onSuccess, onCancel }: ShopEditFormProps) {
  const [shopName, setShopName] = useState(shop.shopName);
  const [shopDescription, setShopDescription] = useState(shop.shopDescription ?? "");
  const [zip, setZip] = useState(shop.zip);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/shops", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: shopName.trim(),
          shopDescription: shopDescription.trim() || undefined,
          zip: zip.trim(),
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update shop");
        return;
      }
      onSuccess({
        ...shop,
        shopName: shopName.trim(),
        shopDescription: shopDescription.trim() || null,
        zip: zip.trim(),
        location: zip.trim(),
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-neutral-200 pt-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}
      <div>
        <label htmlFor="shopName" className="block text-sm font-medium text-neutral-700">
          Shop name *
        </label>
        <input
          id="shopName"
          type="text"
          required
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          placeholder="e.g. Bride's Treasures"
        />
      </div>
      <div>
        <label htmlFor="shopDescription" className="block text-sm font-medium text-neutral-700">
          About your shop
        </label>
        <textarea
          id="shopDescription"
          rows={3}
          value={shopDescription}
          onChange={(e) => setShopDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          placeholder="Tell buyers a bit about what you sell..."
        />
      </div>
      <div>
        <label htmlFor="zip" className="block text-sm font-medium text-neutral-700">
          Location (Zip code) *
        </label>
        <input
          id="zip"
          type="text"
          required
          maxLength={5}
          pattern="[0-9]{5}"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          className="mt-1 block w-full max-w-[140px] rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          placeholder="10001"
        />
        <p className="mt-1 text-xs text-neutral-500">NYC metro area only (5 digits)</p>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
