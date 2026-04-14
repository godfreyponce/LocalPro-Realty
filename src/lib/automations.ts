import type { AutomationLog, Listing, MarketingContent, MediaSchedule } from "./types";
import { DRONE_PRICE_THRESHOLD } from "./constants";
import { addBusinessDays, formatScheduleDate } from "./dates";

type AppendLog = (
  listingId: string,
  log: Omit<AutomationLog, "id" | "timestamp">,
) => string;
type UpdateLog = (
  listingId: string,
  logId: string,
  patch: Partial<Omit<AutomationLog, "id">>,
) => void;
type UpdateListing = (id: string, patch: Partial<Listing>) => void;

interface AutomationCtx {
  appendLog: AppendLog;
  updateLog: UpdateLog;
  updateListing: UpdateListing;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function stripPhotos(listing: Listing): Listing {
  return { ...listing, photos: [] };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function parseJsonOrError(res: Response): Promise<any> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 120)}`);
  }
}

async function runNotification(listing: Listing, ctx: AutomationCtx) {
  const logId = ctx.appendLog(listing.id, {
    type: "notification",
    status: "running",
    details: "Notifying team…",
  });
  try {
    const res = await fetch("/api/notify-team", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        listing: stripPhotos(listing),
        dashboardUrl: window.location.origin,
      }),
    });
    const data = await parseJsonOrError(res);
    ctx.updateLog(listing.id, logId, {
      status: "completed",
      details:
        data.details || "Team notified via email — 3 recipients",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    ctx.updateLog(listing.id, logId, {
      status: "failed",
      details: `Notification failed: ${msg}`,
    });
  }
}

async function runMarketing(listing: Listing, ctx: AutomationCtx) {
  const logId = ctx.appendLog(listing.id, {
    type: "marketing",
    status: "running",
    details: "Generating marketing copy with AI…",
  });
  try {
    const res = await fetch("/api/generate-marketing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ listing: stripPhotos(listing) }),
    });
    const data = (await parseJsonOrError(res)) as MarketingContent & { error?: string };
    ctx.updateListing(listing.id, {
      marketingContent: data,
      stage: "content_generated",
    });
    ctx.updateLog(listing.id, logId, {
      status: data.simulated ? "failed" : "completed",
      details: data.simulated
        ? `AI marketing generation failed: ${data.error ?? "unknown error"}`
        : `AI marketing content generated — MLS description, social caption, email blast`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    ctx.updateLog(listing.id, logId, {
      status: "failed",
      details: `Marketing generation failed: ${msg}`,
    });
  }
}

async function runMediaSchedule(listing: Listing, ctx: AutomationCtx) {
  const logId = ctx.appendLog(listing.id, {
    type: "media_schedule",
    status: "running",
    details: "Scheduling photography & video…",
  });
  try {
    const photographer = addBusinessDays(listing.createdAt, 2);
    const video = addBusinessDays(photographer, 1);
    const includesDrone = listing.price > DRONE_PRICE_THRESHOLD;
    const drone = includesDrone ? addBusinessDays(video, 1) : undefined;

    const schedule: MediaSchedule = {
      photographerDate: photographer.toISOString(),
      videoTourDate: video.toISOString(),
      droneDate: drone?.toISOString(),
      scheduledAt: new Date().toISOString(),
    };

    ctx.updateListing(listing.id, {
      mediaSchedule: schedule,
      stage: "media_scheduled",
    });

    const detail = `Media scheduled — Photography: ${formatScheduleDate(
      schedule.photographerDate,
    )}, Video: ${formatScheduleDate(schedule.videoTourDate)}${
      schedule.droneDate ? `, Drone: ${formatScheduleDate(schedule.droneDate)}` : ""
    }`;

    ctx.updateLog(listing.id, logId, {
      status: "completed",
      details: detail,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    ctx.updateLog(listing.id, logId, {
      status: "failed",
      details: `Media scheduling failed: ${msg}`,
    });
  }
}

export async function runAutomations(listing: Listing, ctx: AutomationCtx) {
  await delay(600);
  await runNotification(listing, ctx);
  await delay(900);
  await runMarketing(listing, ctx);
}

export async function scheduleMedia(listing: Listing, ctx: AutomationCtx) {
  await runMediaSchedule(listing, ctx);
}
