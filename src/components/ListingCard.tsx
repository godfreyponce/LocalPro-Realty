"use client";

import clsx from "clsx";
import { BedDouble, Bath, Ruler } from "lucide-react";
import type { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { relativeTime } from "@/lib/dates";
import { PIPELINE_STAGES } from "@/lib/constants";
import { StageIndicator } from "./StageIndicator";

interface Props {
  listing: Listing;
  onClick: () => void;
}

export function ListingCard({ listing, onClick }: Props) {
  const hasActiveAutomation = listing.automations.some(
    (a) => a.status === "running" || a.status === "pending",
  );
  const progress = PIPELINE_STAGES.indexOf(listing.stage) + 1;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "group relative w-full rounded-lg border border-navy-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-card",
        hasActiveAutomation && "border-l-4 border-l-gold",
      )}
    >
      {listing.photos[0] && (
        <div className="mb-3 overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.photos[0]}
            alt={listing.address}
            className="h-28 w-full object-cover transition group-hover:scale-[1.03]"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-navy">{listing.address}</p>
          <p className="truncate text-xs text-navy-400">
            {listing.city}, {listing.state} {listing.zip}
          </p>
        </div>
        <p className="whitespace-nowrap text-sm font-semibold text-gold-700">
          {formatPrice(listing.price)}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-navy-400">
        <span className="inline-flex items-center gap-1"><BedDouble size={13} /> {listing.bedrooms}</span>
        <span className="inline-flex items-center gap-1"><Bath size={13} /> {listing.bathrooms}</span>
        <span className="inline-flex items-center gap-1"><Ruler size={13} /> {listing.sqft.toLocaleString()}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <StageIndicator stage={listing.stage} />
        <span className="text-[11px] text-navy-400">{progress}/{PIPELINE_STAGES.length}</span>
      </div>

      <p className="mt-2 text-[11px] text-navy-400">
        Added {relativeTime(listing.createdAt)}
      </p>
    </button>
  );
}
