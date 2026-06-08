/** Remember the user's last submitted report pin for 24h (survives page refresh). */

const STORAGE_KEY = "fiji-outage-last-report";
const TTL_MS = 24 * 60 * 60 * 1000;

export interface LastReportHighlight {
  id: string;
  lat: number;
  lng: number;
  at: number;
}

export function saveLastReportHighlight(report: {
  id: string;
  lat: number;
  lng: number;
}): void {
  if (typeof window === "undefined") return;
  const entry: LastReportHighlight = {
    id: report.id,
    lat: report.lat,
    lng: report.lng,
    at: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
}

export function loadLastReportHighlight(): LastReportHighlight | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as LastReportHighlight;
    if (Date.now() - entry.at > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (
      typeof entry.lat !== "number" ||
      typeof entry.lng !== "number" ||
      !entry.id
    ) {
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

export function clearLastReportHighlight(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
