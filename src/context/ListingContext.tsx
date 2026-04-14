"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { nanoid } from "nanoid";
import type {
  AutomationLog,
  Listing,
  NewListingInput,
  PipelineStage,
} from "@/lib/types";
import { PIPELINE_STAGES } from "@/lib/constants";

const STORAGE_KEY = "localpro.listings.v1";

interface ListingContextValue {
  listings: Listing[];
  hydrated: boolean;
  addListing: (input: NewListingInput) => Listing;
  updateListing: (id: string, patch: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  advanceStage: (id: string) => void;
  setStage: (id: string, stage: PipelineStage) => void;
  appendLog: (id: string, log: Omit<AutomationLog, "id" | "timestamp">) => string;
  updateLog: (
    listingId: string,
    logId: string,
    patch: Partial<Omit<AutomationLog, "id">>,
  ) => void;
  getListing: (id: string) => Listing | undefined;
}

const ListingContext = createContext<ListingContextValue | null>(null);

export function ListingProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const listingsRef = useRef<Listing[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Listing[];
        setListings(parsed);
        listingsRef.current = parsed;
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Listing[]) => {
    listingsRef.current = next;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // quota or serialization failure — ignore for demo
      }
    }
  }, []);

  const addListing = useCallback(
    (input: NewListingInput): Listing => {
      const now = new Date().toISOString();
      const listing: Listing = {
        ...input,
        id: nanoid(),
        stage: "new",
        createdAt: now,
        updatedAt: now,
        automations: [],
      };
      setListings((prev) => {
        const next = [listing, ...prev];
        persist(next);
        return next;
      });
      return listing;
    },
    [persist],
  );

  const updateListing = useCallback(
    (id: string, patch: Partial<Listing>) => {
      setListings((prev) => {
        const next = prev.map((l) =>
          l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l,
        );
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setStage = useCallback(
    (id: string, stage: PipelineStage) => {
      updateListing(id, { stage });
    },
    [updateListing],
  );

  const advanceStage = useCallback(
    (id: string) => {
      const current = listingsRef.current.find((l) => l.id === id);
      if (!current) return;
      const idx = PIPELINE_STAGES.indexOf(current.stage);
      if (idx < 0 || idx >= PIPELINE_STAGES.length - 1) return;
      setStage(id, PIPELINE_STAGES[idx + 1]);
    },
    [setStage],
  );

  const appendLog = useCallback(
    (
      listingId: string,
      log: Omit<AutomationLog, "id" | "timestamp">,
    ): string => {
      const entry: AutomationLog = {
        ...log,
        id: nanoid(),
        timestamp: new Date().toISOString(),
      };
      setListings((prev) => {
        const next = prev.map((l) =>
          l.id === listingId
            ? {
                ...l,
                automations: [...l.automations, entry],
                updatedAt: entry.timestamp,
              }
            : l,
        );
        persist(next);
        return next;
      });
      return entry.id;
    },
    [persist],
  );

  const updateLog = useCallback(
    (
      listingId: string,
      logId: string,
      patch: Partial<Omit<AutomationLog, "id">>,
    ) => {
      setListings((prev) => {
        const next = prev.map((l) => {
          if (l.id !== listingId) return l;
          return {
            ...l,
            automations: l.automations.map((a) =>
              a.id === logId ? { ...a, ...patch } : a,
            ),
            updatedAt: new Date().toISOString(),
          };
        });
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const deleteListing = useCallback(
    (id: string) => {
      setListings((prev) => {
        const next = prev.filter((l) => l.id !== id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const getListing = useCallback(
    (id: string) => listingsRef.current.find((l) => l.id === id),
    [],
  );

  const value = useMemo<ListingContextValue>(
    () => ({
      listings,
      hydrated,
      addListing,
      updateListing,
      deleteListing,
      advanceStage,
      setStage,
      appendLog,
      updateLog,
      getListing,
    }),
    [
      listings,
      hydrated,
      addListing,
      updateListing,
      deleteListing,
      advanceStage,
      setStage,
      appendLog,
      updateLog,
      getListing,
    ],
  );

  return (
    <ListingContext.Provider value={value}>{children}</ListingContext.Provider>
  );
}

export function useListings(): ListingContextValue {
  const ctx = useContext(ListingContext);
  if (!ctx) throw new Error("useListings must be used inside <ListingProvider>");
  return ctx;
}
