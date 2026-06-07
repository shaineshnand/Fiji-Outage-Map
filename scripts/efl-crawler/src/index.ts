import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { fetchEflHtml, parsePlannedOutagesTable, EFL_PLANNED_URL } from "./parse.js";
import { syncToSupabase } from "./sync.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local from project root
config({ path: resolve(__dirname, "../../../.env.local") });
config({ path: resolve(__dirname, "../../../.env") });

const dryRun = process.argv.includes("--dry-run");

async function main() {
  console.log("EFL Planned Outage Crawler");
  console.log("Source:", EFL_PLANNED_URL);
  console.log(dryRun ? "Mode: DRY RUN (no database writes)\n" : "Mode: LIVE SYNC\n");

  console.log("1. Fetching EFL page…");
  const html = await fetchEflHtml();
  console.log(`   Downloaded ${(html.length / 1024).toFixed(1)} KB\n`);

  console.log("2. Parsing outage table…");
  const rows = parsePlannedOutagesTable(html);
  console.log(`   Found ${rows.length} planned outage row(s)\n`);

  if (rows.length === 0) {
    console.error(
      "No rows parsed. The EFL page HTML may have changed — check parse.ts"
    );
    process.exit(1);
  }

  rows.slice(0, 3).forEach((r, i) => {
    console.log(`   Sample ${i + 1}: ${r.region}`);
    console.log(`             ${r.startTime.toISOString()} → ${r.endTime.toISOString()}`);
  });
  if (rows.length > 3) console.log(`   …\n`);

  console.log("3. Geocoding + syncing to Supabase…");
  const result = await syncToSupabase(rows, { dryRun });

  console.log("\n--- Done ---");
  if (!dryRun) {
    console.log(`Upserted:        ${result.upserted}`);
    console.log(`Geocode failed:  ${result.geocodeFailed}`);
    console.log(`Removed stale:   ${result.removedStale}`);
  }
  if (result.errors.length) {
    console.log("Errors:");
    result.errors.forEach((e) => console.log(`  - ${e}`));
  }

  process.exit(result.errors.length && !dryRun ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
