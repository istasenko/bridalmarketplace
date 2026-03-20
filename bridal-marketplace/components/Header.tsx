import Link from "next/link";
import AuthNav from "@/components/AuthNav";

export default function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight text-neutral-800">
          Bridal Marketplace
        </Link>
        <AuthNav />
      </div>
    </header>
  );
}
