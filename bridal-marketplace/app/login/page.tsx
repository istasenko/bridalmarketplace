"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(errorParam === "auth" ? "Authentication failed. Please try again." : null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-heading text-3xl font-bold text-[var(--foreground)]">Log in</h1>
      <p className="mt-2 text-[var(--muted)]">
        Welcome back. Log in to browse or manage your listings.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-z bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-z border border-[var(--border)] bg-surface px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-z border border-[var(--border)] bg-surface px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-z bg-butter px-4 py-2.5 text-sm font-medium text-[#001e1d] transition-colors hover:bg-mint active:bg-mint disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
          <Link
            href="/signup"
            className="text-center text-sm text-accent hover:underline"
          >
            Don&apos;t have an account? Sign up here
          </Link>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        <Link href="/" className="hover:underline">
          ← Keep shopping
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16 text-[var(--muted)]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
