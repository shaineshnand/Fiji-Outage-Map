import type { MapFeature, PlannedOutage, ReportCluster } from "./types";

function isPlannedActive(p: PlannedOutage): boolean {
  const now = Date.now();
  return (
    now >= new Date(p.start_time).getTime() &&
    now <= new Date(p.end_time).getTime()
  );
}

function isPlannedCleared(p: PlannedOutage): boolean {
  return Date.now() > new Date(p.end_time).getTime();
}

export function plannedToMapFeatures(planned: PlannedOutage[]): MapFeature[] {
  return planned.map((p) => ({
    kind: "planned" as const,
    id: p.id,
    layer: isPlannedCleared(p)
      ? ("cleared" as const)
      : isPlannedActive(p)
        ? ("planned" as const)
        : ("planned" as const),
    location: p.location,
    latitude: p.latitude,
    longitude: p.longitude,
    start_time: p.start_time,
    end_time: p.end_time,
    reason: p.reason,
    confidence: 100,
  }));
}

export function clusterToMapFeature(cluster: ReportCluster): MapFeature {
  const primary = cluster.reports[0];
  return {
    kind: "community",
    id: cluster.id,
    layer: cluster.layer,
    location: cluster.location,
    latitude: cluster.latitude,
    longitude: cluster.longitude,
    reportCount: cluster.reportCount,
    confidence: cluster.confidence,
    latestReported: cluster.latestReported,
    description: primary?.description ?? null,
  };
}

export function buildMapFeatures(
  planned: PlannedOutage[],
  clusters: ReportCluster[]
): MapFeature[] {
  const plannedFeatures = plannedToMapFeatures(planned).map((f) => {
    if (f.kind === "planned" && Date.now() > new Date(f.end_time).getTime()) {
      return { ...f, layer: "cleared" as const };
    }
    if (f.kind === "planned" && Date.now() < new Date(f.start_time).getTime()) {
      return { ...f, layer: "planned" as const };
    }
    return f;
  });

  return [
    ...plannedFeatures,
    ...clusters.map(clusterToMapFeature),
  ];
}

export function filterMapFeatures(
  features: MapFeature[],
  filters: {
    planned: boolean;
    active_reported: boolean;
    unconfirmed: boolean;
    cleared: boolean;
  }
): MapFeature[] {
  return features.filter((f) => {
    const layer = f.kind === "planned" ? f.layer : f.layer;
    if (layer === "planned") return filters.planned;
    if (layer === "active_reported") return filters.active_reported;
    if (layer === "unconfirmed") return filters.unconfirmed;
    if (layer === "cleared") return filters.cleared;
    return true;
  });
}
