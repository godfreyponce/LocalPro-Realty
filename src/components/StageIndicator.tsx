import clsx from "clsx";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/lib/constants";
import type { PipelineStage } from "@/lib/types";

export function StageIndicator({ stage }: { stage: PipelineStage }) {
  const currentIdx = PIPELINE_STAGES.indexOf(stage);
  return (
    <div className="flex items-center gap-1.5">
      {PIPELINE_STAGES.map((s, i) => {
        const active = i <= currentIdx;
        const current = i === currentIdx;
        return (
          <div key={s} className="flex items-center gap-1.5" title={STAGE_LABELS[s]}>
            <span
              className={clsx(
                "h-2 w-2 rounded-full transition",
                current
                  ? "scale-125 bg-gold ring-2 ring-gold/30"
                  : active
                  ? "bg-navy"
                  : "bg-navy-100",
              )}
            />
            {i < PIPELINE_STAGES.length - 1 && (
              <span className={clsx("h-px w-4", active ? "bg-navy" : "bg-navy-100")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StageBadge({ stage }: { stage: PipelineStage }) {
  const palette: Record<PipelineStage, string> = {
    new: "bg-navy-50 text-navy-500 ring-navy-200",
    content_generated: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    media_scheduled: "bg-amber-50 text-amber-700 ring-amber-200",
    review: "bg-purple-50 text-purple-700 ring-purple-200",
    live: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset",
        palette[stage],
      )}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}
