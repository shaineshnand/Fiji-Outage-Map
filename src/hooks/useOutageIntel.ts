"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clusterCommunityReports } from "@/lib/clustering";
import {
  buildMapFeatures,
  filterMapFeatures,
} from "@/lib/mapFeatures";
import { isInsideFiji } from "@/lib/fijiBounds";
import {
  fetchCommunityReports,
  fetchPlannedOutages,
  getSupabasePublicKey,
  subscribeToOutageData,
} from "@/lib/supabase";
import type {
  CommunityReport,
  MapLayerFilters,
  PlannedOutage,
} from "@/lib/types";
import { DEFAULT_LAYER_FILTERS } from "@/lib/types";

export function useOutageIntel() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [planned, setPlanned] = useState<PlannedOutage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layerFilters, setLayerFilters] =
    useState<MapLayerFilters>(DEFAULT_LAYER_FILTERS);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [community, plannedRows] = await Promise.all([
        fetchCommunityReports(),
        fetchPlannedOutages(),
      ]);
      setReports(community);
      setPlanned(plannedRows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load outage data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !getSupabasePublicKey()) {
      return;
    }

    const unsubscribe = subscribeToOutageData(refresh);
    const interval = setInterval(refresh, 60_000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [refresh]);

  const clusters = useMemo(
    () => clusterCommunityReports(reports),
    [reports]
  );

  const allMapFeatures = useMemo(
    () => buildMapFeatures(planned, clusters),
    [planned, clusters]
  );

  const mapFeatures = useMemo(
    () => filterMapFeatures(allMapFeatures, layerFilters),
    [allMapFeatures, layerFilters]
  );

  const stats = useMemo(() => {
    const plannedOnMap = mapFeatures
      .filter((f) => f.kind === "planned" && f.layer === "planned")
      .filter((f) => isInsideFiji(f.latitude, f.longitude)).length;

    const unplannedOnMap = clusters.filter(
      (c) => c.layer === "active_reported" || c.layer === "unconfirmed"
    ).length;

    return {
      plannedOnMap,
      unplannedOnMap,
      totalReports: reports.length,
      plannedVisibleOnMap: plannedOnMap,
    };
  }, [clusters, reports, mapFeatures]);

  const toggleLayer = (key: keyof MapLayerFilters) => {
    setLayerFilters((f) => ({ ...f, [key]: !f[key] }));
  };

  return {
    reports,
    planned,
    clusters,
    mapFeatures,
    allMapFeatures,
    loading,
    error,
    refresh,
    layerFilters,
    setLayerFilters,
    toggleLayer,
    stats,
    supabaseConfigured: isSupabaseConfigured(),
  };
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      getSupabasePublicKey() &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
  );
}
