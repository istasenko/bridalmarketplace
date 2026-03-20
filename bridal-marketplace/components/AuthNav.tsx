"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AuthNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetch("/api/me", { credentials: "include" })
          .then((r) => r.json())
          .then((data) => {
            if (data.role === "seller" && data.profile?.id) setSellerId(data.profile.id);
          })
          .catch(() => {});
      }
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSellerId(null);
      if (session?.user) {
        fetch("/api/me", { credentials: "include" })
          .then((r) => r.json())
          .then((data) => {
            if (data.role === "seller" && data.profile?.id) setSellerId(data.profile.id);
          })
          .catch(() => {});
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <nav className="flex items-center gap-6">
        <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900">
          Browse
        </Link>
        <Link href="/sell" className="text-sm font-medium text-neutral-800 hover:underline">
          Sell
        </Link>
        <Link href="/api-docs" className="text-sm text-neutral-600 hover:text-neutral-900" title="API Documentation">
          API
        </Link>
      </nav>
    );
  }

  if (user) {
    return (
      <nav className="flex items-center gap-6">
        <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900">
          Browse
        </Link>
        <Link href="/sell" className="text-sm font-medium text-neutral-800 hover:underline">
          Sell
        </Link>
        {sellerId && (
          <Link
            href={`/shops/${sellerId}`}
            className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
          >
            My shop
          </Link>
        )}
        <Link href="/api-docs" className="text-sm text-neutral-600 hover:text-neutral-900" title="API Documentation">
          API
        </Link>
        <span className="text-sm text-neutral-500">
          {user.email}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          Log out
        </button>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-6">
      <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900">
        Browse
      </Link>
        <Link href="/sell" className="text-sm font-medium text-neutral-800 hover:underline">
          Sell
        </Link>
        <Link href="/api-docs" className="text-sm text-neutral-600 hover:text-neutral-900" title="API Documentation">
          API
        </Link>
        <Link
          href="/login"
        className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
      >
        Sign up
      </Link>
    </nav>
  );
}
