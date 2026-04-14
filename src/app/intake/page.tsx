import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IntakeForm } from "@/components/IntakeForm";

export default function IntakePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-navy-400 transition hover:text-navy"
      >
        <ArrowLeft size={14} /> Back to pipeline
      </Link>
      <header className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-navy">
          New Listing Intake
        </h1>
        <p className="mt-2 text-navy-400">
          Capture the property details once. We&apos;ll notify the team, draft
          the marketing copy, and schedule the media shoot automatically.
        </p>
      </header>
      <IntakeForm />
    </div>
  );
}
