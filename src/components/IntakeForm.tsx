"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useListings } from "@/context/ListingContext";
import { runAutomations } from "@/lib/automations";
import type { NewListingInput } from "@/lib/types";

const MAX_PHOTOS = 5;
const MAX_BYTES = 4 * 1024 * 1024;

interface FormState {
  address: string;
  city: string;
  state: string;
  zip: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  description: string;
}

const empty: FormState = {
  address: "",
  city: "",
  state: "",
  zip: "",
  price: "",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  description: "",
};

export function IntakeForm() {
  const router = useRouter();
  const { addListing, appendLog, updateLog, updateListing } = useListings();
  const [form, setForm] = useState<FormState>(empty);
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const readPhotos = useCallback(
    async (files: FileList | File[]) => {
      const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"));
      const available = MAX_PHOTOS - photos.length;
      const toAdd = incoming.slice(0, available);
      const results: string[] = [];
      for (const file of toAdd) {
        if (file.size > MAX_BYTES) continue;
        const b64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        results.push(b64);
      }
      setPhotos((prev) => [...prev, ...results]);
    },
    [photos.length],
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) void readPhotos(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const price = Number(form.price);
    const bedrooms = Number(form.bedrooms);
    const bathrooms = Number(form.bathrooms);
    const sqft = Number(form.sqft);

    if (!form.address || !form.city || !form.state || !form.zip) {
      setError("Please fill in the full address.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price.");
      return;
    }
    if (!Number.isFinite(bedrooms) || !Number.isFinite(bathrooms) || !Number.isFinite(sqft)) {
      setError("Enter valid beds, baths, and square feet.");
      return;
    }

    const payload: NewListingInput = {
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
      zip: form.zip.trim(),
      price,
      bedrooms,
      bathrooms,
      sqft,
      description: form.description.trim(),
      photos,
    };

    setSubmitting(true);
    const listing = addListing(payload);
    router.push("/");
    void runAutomations(listing, { appendLog, updateLog, updateListing });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="card p-6 md:p-8">
        <div className="mb-6">
          <h2 className="font-display text-2xl text-navy">Property Details</h2>
          <p className="mt-1 text-sm text-navy-400">
            Basic facts about the home — this feeds every downstream automation.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
          <div className="md:col-span-6">
            <label className="field-label" htmlFor="address">Street address</label>
            <input id="address" className="field-input" value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Lakeview Drive" required />
          </div>
          <div className="md:col-span-3">
            <label className="field-label" htmlFor="city">City</label>
            <input id="city" className="field-input" value={form.city}
              onChange={(e) => set("city", e.target.value)} placeholder="Austin" required />
          </div>
          <div className="md:col-span-1">
            <label className="field-label" htmlFor="state">State</label>
            <input id="state" className="field-input" value={form.state} maxLength={2}
              onChange={(e) => set("state", e.target.value.toUpperCase())}
              placeholder="TX" required />
          </div>
          <div className="md:col-span-2">
            <label className="field-label" htmlFor="zip">Zip</label>
            <input id="zip" className="field-input" value={form.zip}
              onChange={(e) => set("zip", e.target.value)} placeholder="78701" required />
          </div>
          <div className="md:col-span-2">
            <label className="field-label" htmlFor="price">List price (USD)</label>
            <input id="price" type="number" min="0" className="field-input"
              value={form.price} onChange={(e) => set("price", e.target.value)}
              placeholder="725000" required />
          </div>
          <div className="md:col-span-1">
            <label className="field-label" htmlFor="bedrooms">Beds</label>
            <input id="bedrooms" type="number" min="0" className="field-input"
              value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)}
              placeholder="4" required />
          </div>
          <div className="md:col-span-1">
            <label className="field-label" htmlFor="bathrooms">Baths</label>
            <input id="bathrooms" type="number" min="0" step="0.5" className="field-input"
              value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)}
              placeholder="2.5" required />
          </div>
          <div className="md:col-span-2">
            <label className="field-label" htmlFor="sqft">Square feet</label>
            <input id="sqft" type="number" min="0" className="field-input"
              value={form.sqft} onChange={(e) => set("sqft", e.target.value)}
              placeholder="2400" required />
          </div>
        </div>
      </section>

      <section className="card p-6 md:p-8">
        <div className="mb-6">
          <h2 className="font-display text-2xl text-navy">Agent Description</h2>
          <p className="mt-1 text-sm text-navy-400">
            Raw notes — Claude will use this to craft polished marketing copy.
          </p>
        </div>
        <textarea
          className="field-input min-h-[160px] resize-y leading-relaxed"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Just walked through — gorgeous light-filled living room with vaulted ceilings, remodeled kitchen with quartz counters, primary suite has a huge walk-in closet and spa bath. Backyard is small but beautifully landscaped. Walking distance to Central Market."
        />
      </section>

      <section className="card p-6 md:p-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl text-navy">Photos</h2>
            <p className="mt-1 text-sm text-navy-400">
              Optional — up to {MAX_PHOTOS} images (≤4MB each).
            </p>
          </div>
          <span className="text-xs font-medium text-navy-400">
            {photos.length}/{MAX_PHOTOS}
          </span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition ${
            dragging
              ? "border-gold bg-gold/5"
              : "border-navy-200 bg-navy-50/40 hover:border-gold hover:bg-gold/5"
          }`}
        >
          <ImagePlus className="mb-2 text-navy-300" size={28} />
          <p className="text-sm font-medium text-navy">
            Drop photos here, or click to browse
          </p>
          <p className="mt-1 text-xs text-navy-400">PNG, JPG, WEBP</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) void readPhotos(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {photos.length > 0 && (
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {photos.map((src, i) => (
              <li key={i} className="group relative overflow-hidden rounded-md border border-navy-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Photo ${i + 1}`} className="h-28 w-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
                  }}
                  className="absolute right-1.5 top-1.5 rounded-md bg-white/90 p-1 text-red-600 opacity-0 shadow transition group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <p className="text-xs text-navy-400">
          Submitting triggers the team email and AI marketing draft. Media scheduling fires once an agent reviews and approves the copy.
        </p>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Submitting…
            </>
          ) : (
            "Submit & run automations"
          )}
        </button>
      </div>
    </form>
  );
}
