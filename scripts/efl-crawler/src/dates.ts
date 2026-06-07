/**
 * Parse EFL date strings like "04th June 2024 09:00 AM" (Fiji time).
 */

const MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

/** Fiji is UTC+12 (no DST) */
const FIJI_OFFSET_MS = 12 * 60 * 60 * 1000;

export function parseEflDateTime(raw: string): Date | null {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;

  // 04th June 2024 09:00 AM
  const match = cleaned.match(
    /(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );

  if (!match) return null;

  const day = parseInt(match[1], 10);
  const monthName = match[2].toLowerCase();
  const year = parseInt(match[3], 10);
  let hour = parseInt(match[4], 10);
  const minute = parseInt(match[5], 10);
  const ampm = match[6].toUpperCase();

  const month = MONTHS[monthName];
  if (month === undefined) return null;

  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  // Build as Fiji local → UTC
  const utcMs = Date.UTC(year, month, day, hour, minute, 0, 0) - FIJI_OFFSET_MS;
  const d = new Date(utcMs);
  return Number.isNaN(d.getTime()) ? null : d;
}
