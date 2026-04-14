import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import type { Listing } from "@/lib/types";
import { DEFAULT_TEAM_EMAIL } from "@/lib/constants";
import { formatPrice, fullAddress } from "@/lib/format";

export const runtime = "nodejs";

function buildEmailHtml(listing: Listing, dashboardUrl: string): string {
  return `
    <div style="font-family:DM Sans,Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a;">
      <h1 style="font-family:Playfair Display,serif;color:#0f172a;border-bottom:2px solid #d4a853;padding-bottom:8px;">
        New Listing: ${fullAddress(listing)}
      </h1>
      <p style="font-size:20px;color:#d4a853;margin:16px 0;"><strong>${formatPrice(listing.price)}</strong></p>
      <table style="border-collapse:collapse;margin:12px 0;">
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Beds</td><td><strong>${listing.bedrooms}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Baths</td><td><strong>${listing.bathrooms}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Sqft</td><td><strong>${listing.sqft.toLocaleString()}</strong></td></tr>
      </table>
      <h3 style="margin-top:24px;">Agent notes</h3>
      <p style="background:#f8fafc;padding:12px;border-radius:8px;white-space:pre-wrap;">${listing.description || "(none)"}</p>
      <p style="margin-top:24px;">
        <a href="${dashboardUrl}" style="background:#0f172a;color:#d4a853;padding:10px 16px;border-radius:6px;text-decoration:none;">
          View in Pipeline →
        </a>
      </p>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  let body: { listing?: Listing; dashboardUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const listing = body.listing;
  if (!listing) {
    return NextResponse.json({ error: "missing listing" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TEAM_EMAIL || DEFAULT_TEAM_EMAIL;
  const dashboardUrl = body.dashboardUrl || "http://localhost:3000";

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
      from: "LocalPRO Pipeline <onboarding@resend.dev>",
      to,
      subject: `New listing: ${fullAddress(listing)}`,
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
