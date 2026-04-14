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
        <p className="mt-3 rounded-md border-l-4 border-gold bg-gold/5 px-4 py-3 text-navy">
          <strong>Submit once.</strong> We notify the team, draft your MLS,
          social, and email copy with AI, and book the shoot — before you
          leave the driveway.
        </p>
        <p className="mt-3 text-sm text-navy-400">
          Capture the property details below. Every downstream automation
          pulls from this form.
        </p>
      </header>
      <IntakeForm />
    </div>
  );
}
