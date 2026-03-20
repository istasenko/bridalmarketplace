"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Role = "browser" | "seller" | null;

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>(null);
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
    if (!role) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const metadata: Record<string, unknown> = { name, role };
      if (role === "browser") {
        if (zip) metadata.zip = zip;
        if (weddingDate) metadata.wedding_date = weddingDate;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (role === "seller") {
        router.push("/sell/setup");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (role === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-2xl font-semibold text-neutral-900">Create an account</h1>
        <p className="mt-2 text-neutral-600">
          Are you here to browse and buy, or to sell your wedding items?
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setRole("browser")}
            className="flex flex-col rounded-lg border-2 border-neutral-200 bg-white p-6 text-left transition-colors hover:border-neutral-400 hover:bg-neutral-50"
          >
            <span className="font-semibold text-neutral-900">I&apos;m a browser</span>
            <span className="mt-2 text-sm text-neutral-600">
              I want to browse listings, save favorites, and contact sellers.
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRole("seller")}
            className="flex flex-col rounded-lg border-2 border-neutral-200 bg-white p-6 text-left transition-colors hover:border-neutral-400 hover:bg-neutral-50"
          >
            <span className="font-semibold text-neutral-900">I&apos;m a seller</span>
            <span className="mt-2 text-sm text-neutral-600">
              I want to list items, set up my shop, and connect with buyers.
            </span>
          </button>
        </div>
        <p className="mt-8 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-neutral-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setRole(null)}
          className="text-sm text-neutral-500 hover:text-neutral-700 hover:underline"
        >
          ← Change
        </button>
        <span className="text-sm text-neutral-600">
          Signing up as {role === "browser" ? "browser" : "seller"}
        </span>
      </div>

      <h1 className="text-2xl font-semibold text-neutral-900">Sign up</h1>
      <p className="mt-2 text-neutral-600">
        {role === "browser"
          ? "Create an account to browse and contact sellers."
          : "Create an account to start selling. You&apos;ll set up your shop next."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
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
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
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
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          <p className="mt-1 text-xs text-neutral-500">At least 6 characters</p>
        </div>

        {role === "browser" && (
          <>
            <div>
              <label htmlFor="zip" className="block text-sm font-medium text-neutral-700">
                Zip code <span className="text-neutral-500">(optional)</span>
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
                className="mt-1 block w-full max-w-[140px] rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
              <p className="mt-1 text-xs text-neutral-500">For &quot;near me&quot; filtering</p>
            </div>
            <div>
              <label htmlFor="weddingDate" className="block text-sm font-medium text-neutral-700">
                Wedding date <span className="text-neutral-500">(optional)</span>
              </label>
              <input
                id="weddingDate"
                name="weddingDate"
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="mt-1 block w-full max-w-[180px] rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
          <Link
            href="/login"
            className="text-center text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
          >
            Already have an account? Log in
          </Link>
        </div>
      </form>
    </div>
  );
}
