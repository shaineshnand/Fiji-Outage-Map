import { EFL_PLANNED_URL, fetchEflHtml, parsePlannedOutagesTable } from "./parse";
import { syncToSupabase } from "./sync";

export interface CrawlResult {
  source: string;
  rowCount: number;
  upserted: number;
  geocodeFailed: number;
  removedStale: number;
  errors: string[];
  durationMs: number;
}

export async function runEflCrawl(options?: {
  dryRun?: boolean;
  quiet?: boolean;
}): Promise<CrawlResult> {
  const dryRun = options?.dryRun ?? false;
  const quiet = options?.quiet ?? false;
  const started = Date.now();

  if (!quiet) {
    console.log("[EFL crawler] Fetching", EFL_PLANNED_URL);
  }

  const html = await fetchEflHtml();
  const rows = parsePlannedOutagesTable(html);

  if (rows.length === 0) {
    throw new Error("No rows parsed from EFL page — HTML layout may have changed");
  }

  if (!quiet) {
    console.log(`[EFL crawler] Found ${rows.length} row(s), syncing…`);
  }

  const sync = await syncToSupabase(rows, { dryRun, quiet });

  const result: CrawlResult = {
    source: EFL_PLANNED_URL,
    rowCount: rows.length,
    ...sync,
    durationMs: Date.now() - started,
  };

  if (!quiet) {
    console.log(
      `[EFL crawler] Done in ${(result.durationMs / 1000).toFixed(1)}s — upserted ${result.upserted}, failed geocode ${result.geocodeFailed}`
    );
  }

  return result;
}
