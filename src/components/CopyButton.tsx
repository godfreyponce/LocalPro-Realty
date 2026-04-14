"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-navy-200 bg-white px-3 py-1.5 text-xs font-medium text-navy transition hover:border-gold hover:text-gold-700"
    >
      {copied ? (
        <>
          <Check size={13} className="text-emerald-600" /> Copied
        </>
      ) : (
        <>
          <Copy size={13} /> Copy
        </>
      )}
    </button>
  );
}
