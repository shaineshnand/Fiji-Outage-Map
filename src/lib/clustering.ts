import type { CommunityReport } from "./types";
import {
  confidenceFromReportCount,
  layerFromConfidence,
} from "./confidence";
import type { CommunityLayerType, ReportCluster } from "./types";

/** ~8 km — reports within this distance group into one cluster */
const CLUSTER_RADIUS_KM = 8;

const CLEARED_HOURS = 72;

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isReportCleared(timeReported: string): boolean {
  const ageHours =
    (Date.now() - new Date(timeReported).getTime()) / (1000 * 60 * 60);
  return ageHours >= CLEARED_HOURS;
}

function clusterCentroid(reports: CommunityReport[]): {
  lat: number;
  lng: number;
} {
  const lat =
    reports.reduce((s, r) => s + r.latitude, 0) / reports.length;
  const lng =
    reports.reduce((s, r) => s + r.longitude, 0) / reports.length;
  return { lat, lng };
}

/**
 * Groups nearby community reports into clusters for map display + confidence.
 */
export function clusterCommunityReports(
  reports: CommunityReport[]
): ReportCluster[] {
  const active = reports.filter((r) => !isReportCleared(r.time_reported));
  const cleared = reports.filter((r) => isReportCleared(r.time_reported));

  const clusters: ReportCluster[] = [];

  function buildClusters(pool: CommunityReport[], forceCleared: boolean) {
    const remaining = [...pool];

    while (remaining.length > 0) {
      const seed = remaining.shift()!;
      const group = [seed];

      for (let i = remaining.length - 1; i >= 0; i--) {
        const r = remaining[i];
        if (
          haversineKm(seed.latitude, seed.longitude, r.latitude, r.longitude) <=
          CLUSTER_RADIUS_KM
        ) {
          group.push(r);
          remaining.splice(i, 1);
        }
      }

      const { lat, lng } = clusterCentroid(group);
      const count = group.length;
      const confidence = confidenceFromReportCount(count);
      const latest = group.reduce((a, b) =>
        new Date(b.time_reported) > new Date(a.time_reported) ? b : a
      );
      const allCleared =
        forceCleared || group.every((r) => isReportCleared(r.time_reported));
      const layer: CommunityLayerType = layerFromConfidence(
        confidence,
        allCleared
      );

      clusters.push({
        id: `cluster-${group.map((r) => r.id).sort().join("-")}`,
        latitude: lat,
        longitude: lng,
        location: latest.location,
        reportCount: count,
        confidence,
        layer,
        reports: group,
        latestReported: latest.time_reported,
      });
    }
  }

  buildClusters(active, false);
  buildClusters(cleared, true);

  return clusters;
}
