import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { runEflCrawl } from "../../../src/lib/efl-crawler/run";

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(__dirname, "../../../.env.local") });
config({ path: resolve(__dirname, "../../../.env") });

const dryRun = process.argv.includes("--dry-run");

async function main() {
  console.log("EFL Planned Outage Crawler");
  console.log(dryRun ? "Mode: DRY RUN (no database writes)\n" : "Mode: LIVE SYNC\n");

  const result = await runEflCrawl({ dryRun });

  console.log("\n--- Done ---");
  if (!dryRun) {
    console.log(`Rows parsed:     ${result.rowCount}`);
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
