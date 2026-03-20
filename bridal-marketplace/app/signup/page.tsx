"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zip, setZip] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const metadata: Record<string, unknown> = { name, role: "browser" };
      if (zip) metadata.zip = zip;
      if (weddingDate) metadata.wedding_date = weddingDate;

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-heading text-3xl font-bold text-[var(--foreground)]">Create an account</h1>
      <p className="mt-2 text-[var(--muted)]">
        You can browse and buy, or set up a shop to sell — one account does both.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-z bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)]">
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-z border border-[var(--border)] px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-z border border-[var(--border)] px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
            Password *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-z border border-[var(--border)] px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">At least 6 characters</p>
        </div>

        <div>
          <label htmlFor="zip" className="block text-sm font-medium text-[var(--foreground)]">
            Zip code <span className="text-[var(--muted)]">(optional)</span>
          </label>
          <input
            id="zip"
            name="zip"
            type="text"
            maxLength={5}
            pattern="[0-9]{5}"
            placeholder="10001"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="mt-1 block w-full max-w-[140px] rounded-z border border-[var(--border)] px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">For &quot;near me&quot; filtering</p>
        </div>
        <div>
          <label htmlFor="weddingDate" className="block text-sm font-medium text-[var(--foreground)]">
            Wedding date <span className="text-[var(--muted)]">(optional)</span>
          </label>
          <input
            id="weddingDate"
            name="weddingDate"
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className="mt-1 block w-full max-w-[180px] rounded-z border border-[var(--border)] px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-z bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
          <Link
            href="/login"
            className="text-center text-sm text-accent hover:underline"
          >
            Already have an account? Log in
          </Link>
        </div>
      </form>
    </div>
  );
}
