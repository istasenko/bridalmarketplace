import Link from "next/link";
import AuthNav from "@/components/AuthNav";

export default function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-white/80 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-heading text-2xl font-bold tracking-tight text-accent">
          Ever After
        </Link>
        <AuthNav />
      </div>
    </header>
  );
}
