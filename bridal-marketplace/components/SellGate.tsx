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
        if (data.role === "seller" && !data.shop) {
          setStatus("setup_shop");
        } else if (data.role === "seller" && data.shop) {
          setStatus("ready");
        } else {
          setStatus("login");
        }
      })
      .catch(() => setStatus("login"));
  }, []);

  if (status === "loading") {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center text-neutral-600">
        Loading...
      </div>
    );
  }

  if (status === "login") {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8">
        <h2 className="text-lg font-medium text-neutral-900">Log in to create listings</h2>
        <p className="mt-2 text-neutral-600">
          You need to be logged in as a seller to list items. Sign up as a seller or log in to
          continue.
        </p>
        <div className="mt-6 flex gap-4">
          <Link
            href={`/login?next=${encodeURIComponent("/sell")}`}
            className="rounded-md bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  if (status === "setup_shop") {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8">
        <h2 className="text-lg font-medium text-neutral-900">Set up your shop first</h2>
        <p className="mt-2 text-neutral-600">
          Before you can create listings, add your shop name and location so buyers know who
          they&apos;re buying from.
        </p>
        <Link
          href="/sell/setup"
          className="mt-6 inline-block rounded-md bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Set up shop
        </Link>
      </div>
    );
  }

  return <CreateListingForm />;
}
