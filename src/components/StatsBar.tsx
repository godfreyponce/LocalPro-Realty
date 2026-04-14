import { differenceInHours } from "date-fns";
import type { Listing } from "@/lib/types";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/lib/constants";

function avgTimeToLive(listings: Listing[]): string {
  const live = listings.filter((l) => l.stage === "live");
  if (live.length === 0) return "—";
  const hours =
    live.reduce(
      (acc, l) => acc + differenceInHours(new Date(l.updatedAt), new Date(l.createdAt)),
      0,
    ) / live.length;
  if (hours < 1) return "<1h";
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

export function StatsBar({ listings }: { listings: Listing[] }) {
  const counts = PIPELINE_STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = listings.filter((l) => l.stage === s).length;
    return acc;
  }, {});

  const tiles = [
    { label: "Total listings", value: listings.length.toString() },
    { label: "In pipeline", value: (listings.length - counts.live).toString() },
    { label: "Live", value: counts.live.toString() },
    { label: "Avg time to live", value: avgTimeToLive(listings) },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">
            {t.label}
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-navy">{t.value}</p>
        </div>
      ))}
      <div className="card col-span-2 p-4 md:col-span-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-navy-400">
          Breakdown
        </p>
        <div className="flex flex-wrap gap-2">
          {PIPELINE_STAGES.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1 text-xs text-navy-500"
            >
              <span className="font-semibold text-navy">{counts[s]}</span>
              {STAGE_LABELS[s]}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
