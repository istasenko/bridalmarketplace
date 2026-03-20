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
        <Link href="/" className="text-sm text-[var(--muted)] transition-colors hover:text-accent">
          Browse
        </Link>
        <Link href="/sell" className="text-sm font-medium text-accent hover:underline">
          Sell
        </Link>
      </nav>
    );
  }

  if (user) {
    return (
      <nav className="flex items-center gap-6">
        <Link href="/" className="text-sm text-[var(--muted)] transition-colors hover:text-accent">
          Browse
        </Link>
        <Link href="/sell" className="text-sm font-medium text-accent hover:underline">
          Sell
        </Link>
        {sellerId && (
          <Link
            href={`/shops/${sellerId}`}
            className="text-sm text-[var(--muted)] transition-colors hover:text-accent hover:underline"
          >
            My shop
          </Link>
        )}
        <span className="text-sm text-[var(--muted)]">
          {user.email}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-[var(--muted)] transition-colors hover:text-accent hover:underline"
        >
          Log out
        </button>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-6">
      <Link href="/" className="text-sm text-[var(--muted)] transition-colors hover:text-accent">
        Browse
      </Link>
      <Link href="/sell" className="text-sm font-medium text-accent hover:underline">
        Sell
      </Link>
      <Link
        href="/login"
        className="rounded-z bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
      >
        Log in
      </Link>
    </nav>
  );
}
