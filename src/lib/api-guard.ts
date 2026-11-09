import { NextRequest, NextResponse } from "next/server";
import type { Listing } from "./types";
import {
  GUESSED_MAX_ADDRESS_LENGTH,
  GUESSED_MAX_CITY_LENGTH,
  GUESSED_MAX_DESCRIPTION_LENGTH,
  GUESSED_MAX_REQUESTS_PER_MINUTE,
  STATE_CODE_LENGTH,
  ZIP_PLUS_4_LENGTH,
} from "./constants";

export type ListingFields = Pick<
  Listing,
  | "address"
  | "city"
  | "state"
  | "zip"
  | "price"
  | "bedrooms"
  | "bathrooms"
  | "sqft"
  | "description"
>;

type Admission =
  | { refusal: NextResponse }
  | { listing: ListingFields; origin: string; body: Record<string, unknown> };

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;
const ONE_MINUTE_MS = 60_000;

let windowStartedAt = 0;
const requestCounts = new Map<string, number>();

function isSingleLineText(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maxLength &&
    !CONTROL_CHARS.test(value)
  );
}

function isCount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= Number.MAX_SAFE_INTEGER
  );
}

function parseListing(raw: unknown): ListingFields | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { address, city, state, zip, price, bedrooms, bathrooms, sqft, description } =
    raw as Record<string, unknown>;

  if (!isSingleLineText(address, GUESSED_MAX_ADDRESS_LENGTH)) return null;
  if (!isSingleLineText(city, GUESSED_MAX_CITY_LENGTH)) return null;
  if (!isSingleLineText(state, STATE_CODE_LENGTH)) return null;
  if (!isSingleLineText(zip, ZIP_PLUS_4_LENGTH)) return null;
  if (!isCount(price) || price === 0) return null;
  if (!isCount(bedrooms) || !isCount(bathrooms) || !isCount(sqft)) return null;
  if (typeof description !== "string") return null;
  if (description.length > GUESSED_MAX_DESCRIPTION_LENGTH) return null;

  return { address, city, state, zip, price, bedrooms, bathrooms, sqft, description };
}

function sameHostOrigin(req: NextRequest): string | null {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return null;
  try {
    const url = new URL(origin);
    const isHttp = url.protocol === "http:" || url.protocol === "https:";
    return isHttp && url.host === host ? url.origin : null;
  } catch {
    return null;
  }
}

function isOverRateLimit(key: string): boolean {
  const now = Date.now();
  if (now - windowStartedAt >= ONE_MINUTE_MS) {
    windowStartedAt = now;
    requestCounts.clear();
  }
  const count = (requestCounts.get(key) ?? 0) + 1;
  requestCounts.set(key, count);
  return count > GUESSED_MAX_REQUESTS_PER_MINUTE;
}

function refuse(status: number, error: string): Admission {
  return { refusal: NextResponse.json({ error }, { status }) };
}

export async function admitListingRequest(
  req: NextRequest,
  route: string,
): Promise<Admission> {
  const origin = sameHostOrigin(req);
  if (!origin) return refuse(403, "forbidden origin");

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (isOverRateLimit(`${route}:${ip}`)) return refuse(429, "too many requests");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return refuse(400, "invalid json");
  }
  if (typeof body !== "object" || body === null) return refuse(400, "invalid body");

  const fields = body as Record<string, unknown>;
  const listing = parseListing(fields.listing);
  if (!listing) return refuse(400, "invalid listing");

  return { listing, origin, body: fields };
}
