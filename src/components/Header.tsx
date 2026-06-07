import Legend from "./Legend";
import StatCard from "./StatCard";

interface HeaderProps {
  plannedOnMap: number;
  unplannedOnMap: number;
  totalReports: number;
}

export default function Header({
  plannedOnMap,
  unplannedOnMap,
  totalReports,
}: HeaderProps) {
  return (
    <header className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0c4a6e] via-[#0e7490] to-[#0f766e]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="logo-box flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/25 backdrop-blur-sm">
              <svg
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 text-teal-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.381.19-.7.163-1.006 0L3.622 5.689A1.125 1.125 0 003 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934a1.125 1.125 0 011.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                />
              </svg>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Fiji Outage Map
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-100 ring-1 ring-emerald-300/30">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-emerald-300" />
                  </span>
                  Live
                </span>
              </div>
              <p className="mt-1.5 max-w-md text-sm text-teal-100/85">
                Real-time power outage intelligence for Fiji — official EFL schedules &amp; community reports
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              label="Planned (EFL)"
              value={plannedOnMap}
              variant="planned"
            />
            <StatCard
              label="Unplanned"
              value={unplannedOnMap}
              variant="danger"
            />
            <StatCard
              label="Reports"
              value={totalReports}
              variant="default"
            />
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur-sm">
          <Legend variant="dark" />
        </div>
      </div>
    </header>
  );
}
