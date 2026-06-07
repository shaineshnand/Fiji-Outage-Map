interface StatCardProps {
  label: string;
  value: number;
  variant?: "default" | "danger" | "planned";
}

const styles = {
  default: {
    ring: "ring-white/20",
    bg: "bg-white/12",
    value: "text-white",
    accent: "bg-teal-300",
  },
  danger: {
    ring: "ring-red-300/30",
    bg: "bg-red-500/15",
    value: "text-red-100",
    accent: "bg-red-400",
  },
  planned: {
    ring: "ring-blue-300/30",
    bg: "bg-blue-500/15",
    value: "text-blue-100",
    accent: "bg-blue-400",
  },
};

export default function StatCard({
  label,
  value,
  variant = "default",
}: StatCardProps) {
  const s = styles[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-xl px-4 py-3.5 backdrop-blur-md ${s.bg} ring-1 ${s.ring}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.accent}`} />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
        {label}
      </p>
      <p
        className={`mt-1 text-3xl font-bold tabular-nums tracking-tight ${s.value}`}
      >
        {value}
      </p>
    </div>
  );
}
