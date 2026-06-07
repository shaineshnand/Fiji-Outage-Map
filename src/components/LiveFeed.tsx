"use client";

import type { PlannedOutage, ReportCluster } from "@/lib/types";
import { formatReportTime } from "@/lib/format";
import { layerColor, layerLabel } from "@/lib/layers";

interface LiveFeedProps {
  planned: PlannedOutage[];
  clusters: ReportCluster[];
  loading: boolean;
  feedFilter: "all" | "planned" | "community";
}

export default function LiveFeed({
  planned,
  clusters,
  loading,
  feedFilter,
}: LiveFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-gradient-to-r from-slate-100 to-slate-50"
          />
        ))}
      </div>
    );
  }

  type FeedItem =
    | { type: "planned"; data: PlannedOutage }
    | { type: "community"; data: ReportCluster };

  const items: FeedItem[] = [];

  if (feedFilter === "all" || feedFilter === "planned") {
    planned.forEach((p) => items.push({ type: "planned", data: p }));
  }
  if (feedFilter === "all" || feedFilter === "community") {
    clusters.forEach((c) => items.push({ type: "community", data: c }));
  }

  items.sort((a, b) => {
    const ta =
      a.type === "planned"
        ? new Date(a.data.start_time).getTime()
        : new Date(a.data.latestReported).getTime();
    const tb =
      b.type === "planned"
        ? new Date(b.data.start_time).getTime()
        : new Date(b.data.latestReported).getTime();
    return tb - ta;
  });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
          📍
        </div>
        <p className="mt-4 font-semibold text-slate-700">No updates yet</p>
        <p className="mt-1 text-sm text-slate-500">Reports will appear here in real time</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3 max-h-[440px] overflow-y-auto scroll-area pr-1">
      {items.slice(0, 30).map((item) => {
        if (item.type === "planned") {
          const p = item.data;
          const now = Date.now();
          const active =
            now >= new Date(p.start_time).getTime() &&
            now <= new Date(p.end_time).getTime();
          const layer = active ? "planned" : "cleared";

          return (
            <li
              key={p.id}
              className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ background: layerColor(layer) }}
              />
              <div className="pl-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900">{p.location}</p>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                    style={{ background: layerColor(layer) }}
                  >
                    EFL
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  {formatReportTime(p.start_time)} → {formatReportTime(p.end_time)}
                </p>
                {(p.affected_area || p.reason) && (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {p.affected_area?.slice(0, 180) || p.reason}
                  </p>
                )}
              </div>
            </li>
          );
        }

        const c = item.data;
        return (
          <li
            key={c.id}
            className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-red-200 hover:shadow-md"
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ background: layerColor(c.layer) }}
            />
            <div className="pl-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-900">{c.location}</p>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ background: layerColor(c.layer) }}
                >
                  {c.confidence}%
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {c.reportCount} report{c.reportCount !== 1 ? "s" : ""} ·{" "}
                {formatReportTime(c.latestReported)}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {layerLabel(c.layer)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
