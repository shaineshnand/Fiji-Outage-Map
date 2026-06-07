/** Community report (stored in `outages` table) */

export type OutageSource = "user_report" | "manual";

export type IssueType = "no_power" | "partial_outage";

export interface CommunityReport {
  id: string;
  location: string;
  issue_type: IssueType;
  time_reported: string;
  source: OutageSource;
  description: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  /** Legacy column — display layer is computed in app */
  status?: string;
}

/** Source A: EFL planned outage */

export interface PlannedOutage {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  start_time: string;
  end_time: string;
  reason: string | null;
  region?: string | null;
  affected_area?: string | null;
  external_id?: string | null;
  scraped_at?: string | null;
  created_at: string;
  updated_at: string;
}

/** Map visualization layers (4-layer system) */

export type MapLayerType =
  | "planned"
  | "active_reported"
  | "unconfirmed"
  | "cleared";

export interface MapLayerFilters {
  planned: boolean;
  active_reported: boolean;
  unconfirmed: boolean;
  cleared: boolean;
}

export const DEFAULT_LAYER_FILTERS: MapLayerFilters = {
  planned: true,
  active_reported: true,
  unconfirmed: true,
  cleared: false,
};

/** Processed cluster of community reports */

export type CommunityLayerType =
  | "active_reported"
  | "unconfirmed"
  | "cleared";

export interface ReportCluster {
  id: string;
  latitude: number;
  longitude: number;
  location: string;
  reportCount: number;
  confidence: number;
  layer: CommunityLayerType;
  reports: CommunityReport[];
  latestReported: string;
}

/** Unified map marker */

export type MapFeature =
  | {
      kind: "planned";
      id: string;
      layer: "planned" | "cleared";
      location: string;
      latitude: number;
      longitude: number;
      start_time: string;
      end_time: string;
      reason: string | null;
      confidence: 100;
    }
  | {
      kind: "community";
      id: string;
      layer: "active_reported" | "unconfirmed" | "cleared";
      location: string;
      latitude: number;
      longitude: number;
      reportCount: number;
      confidence: number;
      latestReported: string;
      description: string | null;
    };

export interface NewCommunityReportInput {
  location: string;
  issue_type: IssueType;
  description?: string;
  latitude: number;
  longitude: number;
  source?: OutageSource;
}

export interface NewPlannedOutageInput {
  location: string;
  latitude: number;
  longitude: number;
  start_time: string;
  end_time: string;
  reason?: string;
}

/** @deprecated Use CommunityReport — kept for gradual migration */
export type Outage = CommunityReport;
