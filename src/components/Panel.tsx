import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  icon?: ReactNode;
}

export default function Panel({
  title,
  subtitle,
  children,
  className = "",
  noPadding = false,
  icon,
}: PanelProps) {
  return (
    <section className={`card overflow-hidden animate-fade-up ${className}`}>
      <div className="card-header flex items-start gap-3">
        {icon && (
          <div className="card-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-700 ring-1 ring-teal-100 [&_svg]:h-5 [&_svg]:w-5">
            {icon}
          </div>
        )}
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className={noPadding ? "" : "card-body"}>{children}</div>
    </section>
  );
}
