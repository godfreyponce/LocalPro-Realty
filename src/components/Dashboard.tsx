"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { useListings } from "@/context/ListingContext";
import { PipelineBoard } from "./PipelineBoard";
import { StatsBar } from "./StatsBar";
import { ListingDetail } from "./ListingDetail";

export function Dashboard() {
  const { listings, hydrated } = useListings();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = listings.find((l) => l.id === selectedId) ?? null;

  if (!hydrated) {
    return (
      <div className="flex h-[40vh] items-center justify-center text-sm text-navy-400">
        Loading pipeline…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy md:text-4xl">
            Listing Pipeline
          </h1>
          <p className="mt-1 text-sm text-navy-400">
            Every listing&apos;s stage, automations, and marketing — all in one view.
          </p>
        </div>
      </div>

      {listings.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <StatsBar listings={listings} />
          <PipelineBoard listings={listings} onSelect={setSelectedId} />
        </>
      )}

      {selected && (
        <ListingDetail listing={selected} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center justify-center gap-4 p-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy">
        <Building2 size={24} />
      </span>
      <div>
        <h2 className="font-display text-xl text-navy">No listings yet</h2>
        <p className="mt-1 text-sm text-navy-400">
          Submit your first property to watch the automations fire in real time.
        </p>
      </div>
      <Link href="/intake" className="btn-primary">
        <Plus size={16} /> Create a listing
      </Link>
    </div>
  );
}
