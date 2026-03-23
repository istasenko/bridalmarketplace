import Link from "next/link";
import AuthNav from "@/components/AuthNav";

export default function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-surface/90 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-heading text-3xl font-semibold text-accent transition-colors hover:opacity-90"
        >
          Ever After
        </Link>
        <AuthNav />
      </div>
    </header>
  );
}
