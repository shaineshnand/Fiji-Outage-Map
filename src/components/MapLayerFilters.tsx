"use client";

import { LAYER_META } from "@/lib/layers";
import type { MapLayerFilters as Filters } from "@/lib/types";

interface MapLayerFiltersProps {
  filters: Filters;
  onToggle: (key: keyof Filters) => void;
}

const ORDER = [
  "planned",
  "active_reported",
  "unconfirmed",
  "cleared",
] as const;

export default function MapLayerFilters({
  filters,
  onToggle,
}: MapLayerFiltersProps) {
  return (
    <div className="filter-pills">
      {ORDER.map((key) => {
        const meta = LAYER_META[key];
        const on = filters[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            className={`filter-pill ${on ? "filter-pill-on" : "filter-pill-off"}`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0 ring-2 ring-white"
              style={{ backgroundColor: on ? meta.color : "#cbd5e1" }}
            />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
