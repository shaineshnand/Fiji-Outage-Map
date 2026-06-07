interface EflDataInfoProps {
  totalScheduled: number;
  visibleOnMap: number;
  hiddenByFilters?: number;
  loading?: boolean;
}

export default function EflDataInfo({
  totalScheduled,
  visibleOnMap,
  hiddenByFilters = 0,
  loading,
}: EflDataInfoProps) {
  const statusText = loading
    ? "Updating…"
    : totalScheduled === 0
      ? "Waiting for first sync…"
      : visibleOnMap === totalScheduled
        ? `${visibleOnMap} shown on map`
        : `${visibleOnMap} on map · ${totalScheduled} scheduled`;

  const filterHint =
    !loading && hiddenByFilters > 0
      ? `${hiddenByFilters} hidden — turn on “Cleared / expired” to show`
      : null;

  return (
    <div className="flex gap-4 rounded-xl border border-blue-200/60 bg-gradient-to-r from-blue-50 to-cyan-50/80 p-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-slate-900">EFL planned outages</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Refreshes every 30 minutes from the official Energy Fiji Limited website.
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-semibold text-blue-800 ring-1 ring-blue-100">
          {statusText}
        </p>
        {filterHint && (
          <p className="mt-1.5 text-xs text-slate-500">{filterHint}</p>
        )}
      </div>
    </div>
  );
}
