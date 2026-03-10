import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight text-neutral-800">
          Bridal Marketplace
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-900">
            Browse
          </Link>
          <Link href="/sell" className="text-sm font-medium text-neutral-800 hover:underline">
            Sell
          </Link>
        </nav>
      </div>
    </header>
  );
}
