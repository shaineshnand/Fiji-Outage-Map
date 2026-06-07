import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <h1 className="text-lg font-semibold text-zinc-900">Page not found</h1>
      <Link
        href="/"
        className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        Return to map
      </Link>
    </div>
  );
}
