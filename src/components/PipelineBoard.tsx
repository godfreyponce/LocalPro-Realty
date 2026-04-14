"use client";

import { PIPELINE_STAGES, STAGE_DESCRIPTIONS, STAGE_LABELS } from "@/lib/constants";
import type { Listing, PipelineStage } from "@/lib/types";
import { ListingCard } from "./ListingCard";

interface Props {
  listings: Listing[];
  onSelect: (id: string) => void;
}

export function PipelineBoard({ listings, onSelect }: Props) {
  const grouped = PIPELINE_STAGES.reduce<Record<PipelineStage, Listing[]>>(
    (acc, s) => {
      acc[s] = [];
      return acc;
    },
    { new: [], content_generated: [], media_scheduled: [], review: [], live: [] },
  );
  for (const l of listings) grouped[l.stage].push(l);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      {PIPELINE_STAGES.map((stage) => (
        <section
          key={stage}
          className="flex flex-col rounded-xl border border-navy-100 bg-navy-50/40 p-3"
        >
          <header className="mb-3 px-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-navy">
                {STAGE_LABELS[stage]}
              </h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-navy-400 ring-1 ring-inset ring-navy-100">
                {grouped[stage].length}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-navy-400">{STAGE_DESCRIPTIONS[stage]}</p>
          </header>
          <div className="flex flex-1 flex-col gap-3">
            {grouped[stage].length === 0 ? (
              <div className="rounded-md border border-dashed border-navy-200 p-4 text-center text-[11px] text-navy-400">
                Nothing here yet
              </div>
            ) : (
              grouped[stage].map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => onSelect(listing.id)}
                />
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
