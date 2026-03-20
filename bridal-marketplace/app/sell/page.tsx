import Link from "next/link";
import SellGate from "@/components/SellGate";

export default function SellPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-neutral-600 hover:text-neutral-900 hover:underline"
      >
        ← Back to marketplace
      </Link>
      <h1 className="text-2xl font-semibold text-neutral-900">Create a listing</h1>
      <p className="mt-2 text-neutral-600">
        Add photos, set a price, choose a category and style, and connect with buyers.
      </p>
      <div className="mt-8">
        <SellGate />
      </div>
    </div>
  );
}
