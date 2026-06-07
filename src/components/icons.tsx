import type { ReactNode } from "react";

type IconProps = { className?: string };

function IconSvg({
  className = "h-4 w-4",
  children,
  strokeWidth = 2,
}: IconProps & { children: ReactNode; strokeWidth?: number }) {
  return (
    <svg
      width={16}
      height={16}
      className={`shrink-0 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function MapPinIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconSvg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </IconSvg>
  );
}

export function BoltIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconSvg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </IconSvg>
  );
}

export function AlertIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconSvg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </IconSvg>
  );
}

export function PlusIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconSvg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </IconSvg>
  );
}

export function ImageIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <IconSvg className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </IconSvg>
  );
}

export function LogoIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <IconSvg className={className} strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934a1.125 1.125 0 01-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689A1.125 1.125 0 003 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934a1.125 1.125 0 011.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </IconSvg>
  );
}
