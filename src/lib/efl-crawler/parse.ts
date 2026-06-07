import * as cheerio from "cheerio";
import { createHash } from "crypto";
import { parseEflDateTime } from "./dates";

export interface EflPlannedRow {
  externalId: string;
  region: string;
  affectedArea: string;
  startTime: Date;
  endTime: Date;
  locationLabel: string;
  reason: string;
}

export const EFL_PLANNED_URL =
  "https://efl.com.fj/about-us/outages-disruptions/planned-outages/";

export async function fetchEflHtml(): Promise<string> {
  const res = await fetch(EFL_PLANNED_URL, {
    headers: {
      "User-Agent": "FijiOutageMap-Crawler/1.0 (educational community project)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!res.ok) {
    throw new Error(`EFL page returned ${res.status} ${res.statusText}`);
  }

  return res.text();
}

function normalizeCell(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function makeExternalId(
  region: string,
  area: string,
  start: string,
  end: string
): string {
  const payload = `${region}|${start}|${end}|${area.slice(0, 120)}`;
  return createHash("sha256").update(payload).digest("hex").slice(0, 32);
}

export function parsePlannedOutagesTable(html: string): EflPlannedRow[] {
  const $ = cheerio.load(html);
  const rows: EflPlannedRow[] = [];

  $("table").each((_, table) => {
    const headers: string[] = [];
    $(table)
      .find("tr")
      .first()
      .find("th, td")
      .each((__, cell) => {
        headers.push(normalizeCell($(cell).text()).toLowerCase());
      });

    const regionIdx = headers.findIndex((h) => h.includes("region"));
    const areaIdx = headers.findIndex((h) => h === "area" || h.includes("area"));
    const startIdx = headers.findIndex((h) => h.includes("start"));
    const endIdx = headers.findIndex(
      (h) => h.includes("end") && !h.includes("start")
    );

    if (regionIdx === -1 || startIdx === -1 || endIdx === -1) return;

    $(table)
      .find("tbody tr, tr")
      .slice(1)
      .each((__, tr) => {
        const cells = $(tr)
          .find("td")
          .map((__, td) => normalizeCell($(td).text()))
          .get();

        if (cells.length < 3) return;

        const region = cells[regionIdx] ?? "";
        const area = areaIdx >= 0 ? (cells[areaIdx] ?? "") : "";
        const startRaw = cells[startIdx] ?? "";
        const endRaw = cells[endIdx] ?? "";

        if (!region || !startRaw || !endRaw) return;

        const startTime = parseEflDateTime(startRaw);
        const endTime = parseEflDateTime(endRaw);

        if (!startTime || !endTime) {
          console.warn(`[EFL crawler] Skip row (bad dates): ${region.slice(0, 40)}…`);
          return;
        }

        const locationLabel =
          region.length > 80 ? `${region.slice(0, 77)}…` : region;

        rows.push({
          externalId: makeExternalId(region, area, startRaw, endRaw),
          region,
          affectedArea: area,
          startTime,
          endTime,
          locationLabel,
          reason: area
            ? `Scheduled maintenance — ${area.slice(0, 500)}`
            : "Scheduled maintenance (EFL planned outage)",
        });
      });
  });

  const seen = new Set<string>();
  return rows.filter((r) => {
    if (seen.has(r.externalId)) return false;
    seen.add(r.externalId);
    return true;
  });
}
