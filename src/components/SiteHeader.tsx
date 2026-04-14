import Link from "next/link";
import { Building2, Plus } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy text-gold transition group-hover:bg-navy-800">
            <Building2 size={20} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold text-navy">
              LocalPRO
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-navy-400">
              Listing Pipeline
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/" className="btn-ghost hidden sm:inline-flex">
            Pipeline
          </Link>
          <Link href="/intake" className="btn-primary">
            <Plus size={16} />
            New Listing
          </Link>
        </nav>
      </div>
    </header>
  );
}
