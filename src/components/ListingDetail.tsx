"use client";

import { useEffect } from "react";
import { ArrowRight, BedDouble, Bath, Ruler, X, PartyPopper, Trash2 } from "lucide-react";
import type { Listing } from "@/lib/types";
import { formatPrice, fullAddress } from "@/lib/format";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/lib/constants";
import { StageBadge, StageIndicator } from "./StageIndicator";
import { MarketingPreview } from "./MarketingPreview";
import { ActivityLog } from "./ActivityLog";
import { MediaScheduleView } from "./MediaScheduleView";
import { useListings } from "@/context/ListingContext";

interface Props {
  listing: Listing;
  onClose: () => void;
}

export function ListingDetail({ listing, onClose }: Props) {
  const { advanceStage, deleteListing } = useListings();
  const idx = PIPELINE_STAGES.indexOf(listing.stage);
  const nextStage = idx < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[idx + 1] : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-navy-100 p-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <StageBadge stage={listing.stage} />
              {listing.stage === "live" && (
                <span className="inline-flex animate-pop items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <PartyPopper size={12} /> On the market!
                </span>
              )}
            </div>
            <h2 className="mt-2 font-display text-2xl text-navy">
              {fullAddress(listing)}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-navy-400">
              <span className="text-base font-semibold text-gold-700">
                {formatPrice(listing.price)}
              </span>
              <span className="inline-flex items-center gap-1"><BedDouble size={14} /> {listing.bedrooms} beds</span>
              <span className="inline-flex items-center gap-1"><Bath size={14} /> {listing.bathrooms} baths</span>
              <span className="inline-flex items-center gap-1"><Ruler size={14} /> {listing.sqft.toLocaleString()} sqft</span>
            </div>
            <div className="mt-3">
              <StageIndicator stage={listing.stage} />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (confirm("Delete this listing? This cannot be undone.")) {
                  deleteListing(listing.id);
                  onClose();
                }
              }}
              className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete listing"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-navy-400 hover:bg-navy-50 hover:text-navy"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {listing.photos.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
                Photos
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {listing.photos.map((src, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={i}
                    src={src}
                    alt={`Photo ${i + 1}`}
                    className="h-32 w-48 flex-none rounded-md object-cover"
                  />
                ))}
              </div>
            </section>
          )}

          {listing.description && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
                Agent notes
              </h3>
              <p className="rounded-md border border-navy-100 bg-navy-50/40 p-4 text-sm text-navy whitespace-pre-wrap">
                {listing.description}
              </p>
            </section>
          )}

          {listing.marketingContent ? (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
                AI-generated marketing
              </h3>
              <MarketingPreview content={listing.marketingContent} />
            </section>
          ) : (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
                AI-generated marketing
              </h3>
              <p className="rounded-md border border-dashed border-navy-200 p-4 text-center text-xs text-navy-400">
                Marketing copy will appear here once Automation #2 completes.
              </p>
            </section>
          )}

          {listing.mediaSchedule && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
                Media schedule
              </h3>
              <MediaScheduleView schedule={listing.mediaSchedule} />
            </section>
          )}

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy-400">
              Activity log
            </h3>
            <ActivityLog logs={listing.automations} />
          </section>
        </div>

        {nextStage && (
          <footer className="flex items-center justify-between gap-3 border-t border-navy-100 bg-navy-50/40 px-6 py-4">
            <p className="text-xs text-navy-400">
              Advance manually once{" "}
              {listing.stage === "media_scheduled"
                ? "the team has reviewed"
                : listing.stage === "review"
                ? "final approval is in"
                : "upstream work is complete"}
              .
            </p>
            <button
              onClick={() => advanceStage(listing.id)}
              className="btn-primary"
            >
              Advance to {STAGE_LABELS[nextStage]}
              <ArrowRight size={14} />
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
