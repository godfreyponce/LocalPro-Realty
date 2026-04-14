import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { Listing, MarketingContent } from "@/lib/types";
import { GROQ_MODEL, MARKETING_PROMPT } from "@/lib/constants";
import { formatPrice, fullAddress } from "@/lib/format";

export const runtime = "nodejs";
export const maxDuration = 60;

function stubContent(listing: Listing): MarketingContent {
  const addr = fullAddress(listing);
  const beds = listing.bedrooms;
  const baths = listing.bathrooms;
  const sqft = listing.sqft.toLocaleString();
  const price = formatPrice(listing.price);

  const mls = `Welcome to ${addr} — a beautifully appointed ${beds}-bedroom, ${baths}-bath residence offering ${sqft} square feet of refined living. Step into light-filled interiors, generous entertaining spaces, and thoughtful finishes throughout. The open-concept layout flows effortlessly from gracious living areas to a chef-inspired kitchen, while oversized windows frame tranquil views. Upstairs, a serene primary suite anchors a restful retreat complete with spa-style bath. Outside, enjoy a private outdoor setting ideal for year-round enjoyment. Ideally located near top-rated schools, dining, and transit, this exceptional home blends timeless character with modern comfort. Offered at ${price}, this is a rare opportunity to own a turnkey residence in one of ${listing.city}'s most coveted neighborhoods. Schedule your private tour today — homes of this caliber don't last long.`;

  const social = `✨ JUST LISTED ✨ ${beds}BR/${baths}BA in ${listing.city} — ${price} · Tour this weekend! #JustListed #${listing.city.replace(/\s+/g, "")}RealEstate #DreamHome`;

  const email = `We're thrilled to introduce ${addr} — a stunning ${beds}-bedroom, ${baths}-bath home offering ${sqft} sqft of elevated living in the heart of ${listing.city}.

From its airy interiors to its thoughtful layout, every detail has been curated for comfort and style. You'll find a gourmet kitchen, generous bedrooms, and inviting outdoor space — all within minutes of the neighborhood's best dining, parks, and schools.

Listed at ${price}. Private showings are filling fast — reply to book a tour before our open house this weekend.`;

  return {
    mlsDescription: mls,
    socialCaption: social,
    emailBlast: email,
    generatedAt: new Date().toISOString(),
    simulated: true,
  };
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON object in response");
  return JSON.parse(candidate.slice(start, end + 1));
}

export async function POST(req: NextRequest) {
  let body: { listing?: Listing };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const listing = body.listing;
  if (!listing) {
    return NextResponse.json({ error: "missing listing" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(stubContent(listing));
  }

  try {
    const client = new Groq({ apiKey });
    const userBlock = `Property:
- Address: ${fullAddress(listing)}
- Price: ${formatPrice(listing.price)}
- Bedrooms: ${listing.bedrooms}
- Bathrooms: ${listing.bathrooms}
- Square feet: ${listing.sqft}
- Agent description: ${listing.description || "(none provided)"}`;

    const resp = await client.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 1200,
      messages: [
        { role: "system", content: MARKETING_PROMPT },
        { role: "user", content: userBlock },
      ],
    });

    const text = resp.choices[0]?.message?.content ?? "";

    const parsed = extractJson(text) as {
      mlsDescription?: string;
      socialCaption?: string;
      emailBlast?: string;
    };

    if (!parsed.mlsDescription || !parsed.socialCaption || !parsed.emailBlast) {
      throw new Error("response missing required fields");
    }

    const result: MarketingContent = {
      mlsDescription: parsed.mlsDescription,
      socialCaption: parsed.socialCaption,
      emailBlast: parsed.emailBlast,
      generatedAt: new Date().toISOString(),
    };
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    const fallback = stubContent(listing);
    return NextResponse.json({ ...fallback, error: message });
  }
}
