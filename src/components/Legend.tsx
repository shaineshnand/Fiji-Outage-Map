import { LAYER_META } from "@/lib/layers";
import type { MapLayerType } from "@/lib/types";

const ORDER: MapLayerType[] = [
  "planned",
  "active_reported",
  "unconfirmed",
  "cleared",
];

interface LegendProps {
  variant?: "light" | "dark";
}

export default function Legend({ variant = "light" }: LegendProps) {
  const isDark = variant === "dark";

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <span
        className={`text-xs font-bold uppercase tracking-wider ${
          isDark ? "text-teal-200/80" : "text-slate-500"
        }`}
      >
        Map layers
      </span>
      {ORDER.map((key) => (
        <span
          key={key}
          className={`inline-flex items-center gap-2 text-xs font-medium ${
            isDark ? "text-white/90" : "text-slate-600"
          }`}
          title={LAYER_META[key].description}
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/30"
            style={{ backgroundColor: LAYER_META[key].color }}
          />
          {LAYER_META[key].label}
        </span>
      ))}
    </div>
  );
}
