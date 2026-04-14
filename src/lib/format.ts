export function formatPrice(n: number): string {
  if (!Number.isFinite(n)) return "$—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatSqft(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${new Intl.NumberFormat("en-US").format(n)} sqft`;
}

export function fullAddress(parts: {
  address: string;
  city: string;
  state: string;
  zip: string;
}): string {
  return `${parts.address}, ${parts.city}, ${parts.state} ${parts.zip}`;
}
