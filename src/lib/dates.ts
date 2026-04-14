import { addBusinessDays as addBiz, format, formatDistanceToNow } from "date-fns";

export function addBusinessDays(from: Date | string, days: number): Date {
  const base = typeof from === "string" ? new Date(from) : from;
  return addBiz(base, days);
}

export function formatScheduleDate(iso: string): string {
  return format(new Date(iso), "EEE, MMM d, yyyy");
}

export function relativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function formatTime(iso: string): string {
  return format(new Date(iso), "h:mm:ss a");
}
