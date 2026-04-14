import Link from "next/link";
import { Building2, Plus } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black bg-black text-white">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gold text-black transition group-hover:bg-gold-400">
            <Building2 size={20} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-bold uppercase tracking-wide text-white">
              LocalPRO Realty
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-gold">
              Listing Pipeline
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            Pipeline
          </Link>
          <Link
            href="/intake"
            className="inline-flex items-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-black transition hover:bg-gold-400"
          >
            <Plus size={16} />
            New Listing
          </Link>
        </nav>
      </div>
    </header>
  );
}
