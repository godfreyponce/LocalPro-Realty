import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  DEFAULT_TEAM_EMAIL,
  GUESSED_MAX_DASHBOARD_URL_LENGTH,
} from "@/lib/constants";
import { formatPrice, fullAddress } from "@/lib/format";
import { admitListingRequest, type ListingFields } from "@/lib/api-guard";

export const runtime = "nodejs";

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
}

function sameOriginUrl(raw: unknown, origin: string): string | null {
  if (raw === undefined) return origin;
  if (typeof raw !== "string") return null;
  if (raw.length > GUESSED_MAX_DASHBOARD_URL_LENGTH) return null;
  try {
    const url = new URL(raw, origin);
    return url.origin === origin ? url.href : null;
  } catch {
    return null;
  }
}

function buildEmailHtml(listing: ListingFields, dashboardUrl: string): string {
  return `
    <div style="font-family:Montserrat,Arial,sans-serif;max-width:560px;margin:auto;color:#191919;">
      <h1 style="font-family:Montserrat,Arial,sans-serif;font-weight:700;color:#000000;border-bottom:2px solid #dbae77;padding-bottom:8px;">
        New Listing: ${escapeHtml(fullAddress(listing))}
      </h1>
      <p style="font-size:20px;color:#dbae77;margin:16px 0;"><strong>${formatPrice(listing.price)}</strong></p>
      <table style="border-collapse:collapse;margin:12px 0;">
        <tr><td style="padding:4px 12px 4px 0;color:#5c5c5c;">Beds</td><td><strong>${listing.bedrooms}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#5c5c5c;">Baths</td><td><strong>${listing.bathrooms}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#5c5c5c;">Sqft</td><td><strong>${listing.sqft.toLocaleString()}</strong></td></tr>
      </table>
      <h3 style="margin-top:24px;">Agent notes</h3>
      <p style="background:#f5f5f5;padding:12px;border-radius:8px;white-space:pre-wrap;">${escapeHtml(listing.description) || "(none)"}</p>
      <p style="margin-top:24px;">
        <a href="${escapeHtml(dashboardUrl)}" style="background:#000000;color:#dbae77;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600;">
          View in Pipeline →
        </a>
      </p>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  const admission = await admitListingRequest(req, "notify-team");
  if ("refusal" in admission) return admission.refusal;
  const { listing, origin, body } = admission;

  const dashboardUrl = sameOriginUrl(body.dashboardUrl, origin);
  if (!dashboardUrl) {
    return NextResponse.json({ error: "invalid dashboardUrl" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TEAM_EMAIL || DEFAULT_TEAM_EMAIL;

  if (!apiKey) {
    return NextResponse.json({
      simulated: true,
      recipient: to,
      details: `Team notified via email — 3 recipients`,
    });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "LocalPRO Realty <onboarding@resend.dev>",
      to,
      subject: `[New Listing] ${fullAddress(listing)} — ${formatPrice(listing.price)}`,
      html: buildEmailHtml(listing, dashboardUrl),
    });
    return NextResponse.json({
      simulated: false,
      recipient: to,
      details: `Team notified via email — sent to ${to}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({
      simulated: true,
      recipient: to,
      error: message,
      details: `Notification fell back to simulation — ${message}`,
    });
  }
}
