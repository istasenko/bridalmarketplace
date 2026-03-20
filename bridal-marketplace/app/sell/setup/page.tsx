"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ShopSetupPage() {
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [zip, setZip] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasShop, setHasShop] = useState(false);

  useEffect(() => {
    const check = async () => {
      const res = await fetch("/api/shops");
      if (res.status === 401) {
        router.replace(`/login?next=${encodeURIComponent("/sell/setup")}`);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.shop) {
          setHasShop(true);
          router.replace("/sell");
          return;
        }
      }
      setChecking(false);
    };
    check();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName,
          shopDescription: shopDescription || undefined,
          zip,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create shop");
        return;
      }
      router.push("/sell");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
      >
        ← Keep shopping
      </Link>
      <h1 className="text-2xl font-semibold text-neutral-900">Set up your shop</h1>
      <p className="mt-2 text-neutral-600">
        Add your shop details so buyers can find and contact you. This info will appear on your listings.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        <div>
          <label htmlFor="shopName" className="block text-sm font-medium text-neutral-700">
            Shop name *
          </label>
          <input
            id="shopName"
            name="shopName"
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
            About your shop <span className="text-neutral-500">(optional)</span>
          </label>
          <textarea
            id="shopDescription"
            name="shopDescription"
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
            name="zip"
            type="text"
            required
            maxLength={5}
            pattern="[0-9]{5}"
            placeholder="10001"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="mt-1 block w-full max-w-[140px] rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          <p className="mt-1 text-xs text-neutral-500">NYC metro area only (5 digits)</p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-neutral-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create shop"}
          </button>
          <Link
            href="/sell"
            className="rounded-md border border-neutral-300 px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Skip for now
          </Link>
        </div>
      </form>
    </div>
  );
}
