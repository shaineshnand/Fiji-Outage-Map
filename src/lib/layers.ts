import type { MapLayerType } from "./types";

export const LAYER_META: Record<
  MapLayerType,
  { label: string; color: string; description: string }
> = {
  planned: {
    label: "Planned (EFL)",
    color: "#2563eb",
    description: "Official scheduled maintenance window",
  },
  active_reported: {
    label: "Active reported",
    color: "#dc2626",
    description: "High-confidence unplanned outage (3+ reports or cluster)",
  },
  unconfirmed: {
    label: "Unconfirmed",
    color: "#ea580c",
    description: "Early community reports (low confidence)",
  },
  cleared: {
    label: "Cleared / expired",
    color: "#71717a",
    description: "Past window or no recent activity",
  },
};

export function layerColor(layer: MapLayerType): string {
  return LAYER_META[layer].color;
}

export function layerLabel(layer: MapLayerType): string {
  return LAYER_META[layer].label;
}
