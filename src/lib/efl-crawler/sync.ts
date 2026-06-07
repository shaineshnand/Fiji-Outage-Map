import { createClient } from "@supabase/supabase-js";
import type { EflPlannedRow } from "./parse";
import { geocodeFijiWithFallback } from "./geocode";

export interface SyncResult {
  upserted: number;
  geocodeSkipped: number;
  geocodeFailed: number;
  removedStale: number;
  errors: string[];
}

interface GeocodedRow extends EflPlannedRow {
  latitude: number;
  longitude: number;
  geocodedName: string;
}

export async function syncToSupabase(
  rows: EflPlannedRow[],
  options: { dryRun: boolean; quiet?: boolean }
): Promise<SyncResult> {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!options.dryRun && (!url || !serviceKey)) {
    throw new Error(
      "Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  const result: SyncResult = {
    upserted: 0,
    geocodeSkipped: 0,
    geocodeFailed: 0,
    removedStale: 0,
    errors: [],
  };

  const geocoded: GeocodedRow[] = [];
  const coordCache = new Map<string, { latitude: number; longitude: number }>();

  if (!options.dryRun && url && serviceKey) {
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
    const ids = rows.map((r) => r.externalId);
    const { data: existing } = await supabase
      .from("planned_outages")
      .select("external_id, latitude, longitude")
      .in("external_id", ids);

    for (const row of existing ?? []) {
      if (
        row.external_id &&
        row.latitude != null &&
        row.longitude != null
      ) {
        coordCache.set(row.external_id, {
          latitude: row.latitude,
          longitude: row.longitude,
        });
      }
    }
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cached = coordCache.get(row.externalId);

    if (cached) {
      result.geocodeSkipped++;
      geocoded.push({
        ...row,
        latitude: cached.latitude,
        longitude: cached.longitude,
        geocodedName: row.locationLabel,
      });
      continue;
    }

    if (!options.quiet) {
      process.stdout.write(
        `  [${i + 1}/${rows.length}] Geocoding ${row.region.slice(0, 50)}… `
      );
    }

    const geo = await geocodeFijiWithFallback(row.region, row.affectedArea);
    if (!geo) {
      if (!options.quiet) console.log("failed");
      result.geocodeFailed++;
      result.errors.push(`Geocode failed: ${row.region}`);
      continue;
    }

    if (!options.quiet) console.log(`→ ${geo.displayName}`);
    geocoded.push({
      ...row,
      latitude: geo.lat,
      longitude: geo.lng,
      geocodedName: geo.displayName,
    });
  }

  if (options.dryRun) {
    if (!options.quiet) {
      console.log("\n--- Dry run: would upsert", geocoded.length, "rows ---");
    }
    return result;
  }

  const supabase = createClient(url!, serviceKey!, {
    auth: { persistSession: false },
  });

  const scrapedAt = new Date().toISOString();
  const externalIds: string[] = [];

  for (const row of geocoded) {
    externalIds.push(row.externalId);

    const { error } = await supabase.from("planned_outages").upsert(
      {
        external_id: row.externalId,
        location: row.locationLabel,
        region: row.region,
        affected_area: row.affectedArea,
        latitude: row.latitude,
        longitude: row.longitude,
        start_time: row.startTime.toISOString(),
        end_time: row.endTime.toISOString(),
        reason: row.reason,
        scraped_at: scrapedAt,
      },
      { onConflict: "external_id" }
    );

    if (error) {
      result.errors.push(`${row.region}: ${error.message}`);
    } else {
      result.upserted++;
    }
  }

  if (externalIds.length > 0) {
    const { data: existing } = await supabase
      .from("planned_outages")
      .select("id, external_id")
      .not("external_id", "is", null);

    const stale =
      existing?.filter(
        (e) => e.external_id && !externalIds.includes(e.external_id)
      ) ?? [];

    if (stale.length > 0) {
      const { error: delErr } = await supabase
        .from("planned_outages")
        .delete()
        .in(
          "id",
          stale.map((s) => s.id)
        );

      if (!delErr) result.removedStale = stale.length;
    }
  }

  return result;
}
