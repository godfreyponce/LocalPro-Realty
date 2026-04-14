"use client";

import clsx from "clsx";
import { CheckCircle2, Loader2, XCircle, Clock, Mail, Sparkles, Camera } from "lucide-react";
import type { AutomationLog, AutomationType } from "@/lib/types";
import { formatTime } from "@/lib/dates";

const ICONS: Record<AutomationType, React.ReactNode> = {
  notification: <Mail size={14} />,
  marketing: <Sparkles size={14} />,
  media_schedule: <Camera size={14} />,
};

const LABEL: Record<AutomationType, string> = {
  notification: "Team notification",
  marketing: "AI marketing copy",
  media_schedule: "Media scheduling",
};

function StatusDot({ status }: { status: AutomationLog["status"] }) {
  if (status === "completed")
    return <CheckCircle2 size={16} className="text-emerald-500" />;
  if (status === "running")
    return <Loader2 size={16} className="animate-spin text-gold" />;
  if (status === "failed")
    return <XCircle size={16} className="text-red-500" />;
  return <Clock size={16} className="text-navy-300" />;
}

export function ActivityLog({ logs }: { logs: AutomationLog[] }) {
  if (logs.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-navy-200 p-4 text-center text-xs text-navy-400">
        No automations have run yet.
      </p>
    );
  }

  return (
    <ol className="relative space-y-4 pl-6">
      <span className="absolute left-2 top-1 h-full w-px bg-navy-100" aria-hidden />
      {logs.map((log) => (
        <li key={log.id} className="relative animate-fade-in">
          <span
            className={clsx(
              "absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2",
              log.status === "completed"
                ? "ring-emerald-400"
                : log.status === "running"
                ? "ring-gold"
                : log.status === "failed"
                ? "ring-red-400"
                : "ring-navy-200",
            )}
          >
            <StatusDot status={log.status} />
          </span>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-navy">
                <span className="text-navy-400">{ICONS[log.type]}</span>
                {LABEL[log.type]}
              </p>
              <p className="mt-0.5 text-xs text-navy-400">{log.details}</p>
            </div>
            <span className="whitespace-nowrap text-[11px] text-navy-300">
              {formatTime(log.timestamp)}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
