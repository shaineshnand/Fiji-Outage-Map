"use client";

import { useEffect, useRef, useState } from "react";
import {
  clearLastReportHighlight,
  loadLastReportHighlight,
  saveLastReportHighlight,
} from "@/lib/lastReportHighlight";
import { useOutageIntel } from "@/hooks/useOutageIntel";
import OutageMap from "@/components/MapLoader";
import ReportForm from "@/components/ReportForm";
import LiveFeed from "@/components/LiveFeed";
import EflDataInfo from "@/components/EflDataInfo";
import SetupBanner from "@/components/SetupBanner";
import Header from "@/components/Header";
import Panel from "@/components/Panel";
import MapLayerFilters from "@/components/MapLayerFilters";
import { isInsideFiji } from "@/lib/fijiBounds";

type SidebarTab = "report" | "updates";
type FeedFilter = "all" | "planned" | "community";

const MapIcon = () => (
  <svg width={20} height={20} className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934a1.125 1.125 0 011.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
  </svg>
);

const ReportIcon = () => (
  <svg width={20} height={20} className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const FeedIcon = () => (
  <svg width={20} height={20} className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

export default function HomePage() {
  const {
    planned,
    clusters,
    mapFeatures,
    allMapFeatures,
    loading,
    error,
    refresh,
    layerFilters,
    toggleLayer,
    stats,
    supabaseConfigured,
  } = useOutageIntel();

  const mapSectionRef = useRef<HTMLDivElement>(null);
  const [pickMode, setPickMode] = useState(false);
  const [pickedPosition, setPickedPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [submittedReport, setSubmittedReport] = useState<{
    id: string;
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const saved = loadLastReportHighlight();
    if (saved) {
      setSubmittedReport({ id: saved.id, lat: saved.lat, lng: saved.lng });
    }
  }, []);

  function togglePickMode() {
    setPickMode((active) => {
      const next = !active;
      if (next) {
        requestAnimationFrame(() => {
          mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
      return next;
    });
  }
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("report");
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");

  return (
    <div className="app-shell">
      <Header
        plannedOnMap={stats.plannedOnMap}
        unplannedOnMap={stats.unplannedOnMap}
        totalReports={stats.totalReports}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {!supabaseConfigured && (
          <div className="mb-6 animate-fade-up">
            <SetupBanner />
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-800 shadow-sm"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
              !
            </span>
            {error}
          </div>
        )}

        <div className="mb-6 hidden animate-fade-up lg:block">
          <EflDataInfo visibleOnMap={stats.plannedVisibleOnMap} loading={loading} />
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7" ref={mapSectionRef}>
            <Panel
              title="Live outage map"
              subtitle="Tap markers for details · Fiji only"
              icon={<MapIcon />}
              noPadding
            >
              <div className="space-y-4 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                <MapLayerFilters filters={layerFilters} onToggle={toggleLayer} />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    <strong className="text-slate-700">{mapFeatures.length}</strong> of{" "}
                    {allMapFeatures.length} visible
                  </span>
                  {pickMode && (
                    <span className="rounded-full bg-teal-100 px-3 py-1 font-semibold text-teal-800 animate-pulse">
                      Tap anywhere on the map (empty area)
                    </span>
                  )}
                  {pickedPosition && !pickMode && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">
                      Pin placed — submit your report →
                    </span>
                  )}
                  {submittedReport && (
                    <span className="rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-800">
                      Your report pin is highlighted on the map
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`map-frame h-[52vh] min-h-[320px] lg:h-[calc(100vh-16rem)] lg:min-h-[500px]${pickMode ? " map-pick-mode" : ""}`}
              >
                <OutageMap
                  features={mapFeatures}
                  pickMode={pickMode}
                  pickedPosition={pickedPosition}
                  submittedReport={submittedReport}
                  onMapClick={(lat, lng) => {
                    if (!isInsideFiji(lat, lng)) return;
                    clearLastReportHighlight();
                    setSubmittedReport(null);
                    setPickedPosition({ lat, lng });
                    setPickMode(false);
                  }}
                />
              </div>
            </Panel>
          </div>

          <div className="lg:col-span-5">
            <div className="tabs mb-5 lg:hidden">
              {(
                [
                  ["report", "Report"],
                  ["updates", "Updates"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSidebarTab(id)}
                  className={`tab ${sidebarTab === id ? "tab-active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto scroll-area">
              <div className="mb-4 lg:hidden">
                <EflDataInfo visibleOnMap={stats.plannedVisibleOnMap} loading={loading} />
              </div>

              <div
                className={sidebarTab === "report" ? "block" : "hidden lg:block"}
                style={{ animationDelay: "0.05s" }}
              >
                <Panel
                  title="Report an outage"
                  subtitle="Help others — takes under a minute"
                  icon={<ReportIcon />}
                >
                  <ReportForm
                    onSuccess={async ({ id, lat, lng }) => {
                      const highlight = { id, lat, lng };
                      saveLastReportHighlight(highlight);
                      setSubmittedReport(highlight);
                      setPickedPosition(null);
                      setPickMode(false);
                      await refresh();
                      mapSectionRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    pickedPosition={pickedPosition}
                    pickMode={pickMode}
                    onTogglePickMode={togglePickMode}
                  />
                </Panel>
              </div>

              <div
                className={sidebarTab === "updates" ? "block" : "hidden lg:block"}
                style={{ animationDelay: "0.1s" }}
              >
                <Panel
                  title="Live updates"
                  subtitle="EFL + community feed"
                  icon={<FeedIcon />}
                >
                  <div className="tabs mb-4">
                    {(
                      [
                        ["all", "All"],
                        ["planned", "EFL"],
                        ["community", "Community"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setFeedFilter(id)}
                        className={`tab text-xs ${feedFilter === id ? "tab-active" : ""}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <LiveFeed
                    planned={planned}
                    clusters={clusters}
                    loading={loading}
                    feedFilter={feedFilter}
                  />
                </Panel>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-teal-900/5 bg-white/60 py-6 text-center backdrop-blur-sm">
        <p className="text-sm text-slate-500">
          Fiji Outage Map · EFL planned data + community intelligence
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Not affiliated with Energy Fiji Limited
        </p>
      </footer>
    </div>
  );
}
