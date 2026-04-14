"use client";

import { useState } from "react";
import clsx from "clsx";
import type { MarketingContent } from "@/lib/types";
import { CopyButton } from "./CopyButton";

type Tab = "mls" | "social" | "email";

const TABS: { id: Tab; label: string }[] = [
  { id: "mls", label: "MLS Description" },
  { id: "social", label: "Social Caption" },
  { id: "email", label: "Email Blast" },
];

export function MarketingPreview({ content }: { content: MarketingContent }) {
  const [tab, setTab] = useState<Tab>("mls");
  const text =
    tab === "mls"
      ? content.mlsDescription
      : tab === "social"
      ? content.socialCaption
      : content.emailBlast;

  return (
    <div className="rounded-lg border border-navy-100 bg-white">
      <div className="flex items-center justify-between border-b border-navy-100 px-3 py-2">
        <div role="tablist" className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                tab === t.id
                  ? "bg-navy text-gold"
                  : "text-navy-400 hover:bg-navy-50 hover:text-navy",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <CopyButton text={text} />
      </div>
      <div className="p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy">{text}</p>
        {content.simulated && (
          <p className="mt-3 text-[11px] italic text-navy-400">
            Simulated copy — set <code className="font-mono">GROQ_API_KEY</code> to
            generate with AI.
          </p>
        )}
      </div>
    </div>
  );
}
