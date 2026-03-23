"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CreateListingForm from "@/components/CreateListingForm";

type Status = "loading" | "login" | "setup_shop" | "ready";

export default function SellGate() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    fetch("/api/me")
      .then((res) => {
        if (res.status === 401) {
          setStatus("login");
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.shop) {
          setStatus("ready");
        } else {
          setStatus("setup_shop");
        }
      })
      .catch(() => setStatus("login"));
  }, []);

  if (status === "loading") {
    return (
      <div className="rounded-z-lg border border-[var(--border)] bg-surface p-8 text-center text-[var(--muted)]">
        Loading...
      </div>
    );
  }

  if (status === "login") {
    return (
      <div className="rounded-z-lg border border-[var(--border)] bg-surface p-8">
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">Log in to create listings</h2>
        <p className="mt-2 text-[var(--muted)]">
          Log in to list items. You can browse and buy without an account, but you need to sign in
          to sell.
        </p>
        <div className="mt-6 flex gap-4">
          <Link
            href={`/login?next=${encodeURIComponent("/sell")}`}
            className="rounded-z bg-butter px-4 py-2.5 text-sm font-medium text-[#001e1d] transition-colors hover:bg-mint active:bg-mint"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-z border border-pale-blue px-4 py-2.5 text-sm font-medium text-pale-blue transition-colors hover:bg-pale-blue-soft"
          >
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  if (status === "setup_shop") {
    return (
      <div className="rounded-z-lg border border-[var(--border)] bg-surface p-8">
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">Set up your shop first</h2>
        <p className="mt-2 text-[var(--muted)]">
          Before you can create listings, add your shop name and location so buyers know who
          they&apos;re buying from.
        </p>
        <Link
          href="/sell/setup"
          className="mt-6 inline-block rounded-z bg-butter px-4 py-2.5 text-sm font-medium text-[#001e1d] transition-colors hover:bg-mint active:bg-mint"
        >
          Set up shop
        </Link>
      </div>
    );
  }

  return <CreateListingForm />;
}
