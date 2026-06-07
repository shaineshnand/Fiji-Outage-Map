export default function SetupBanner() {
  return (
    <div className="flex gap-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div className="text-sm text-amber-950">
        <p className="font-semibold">Connect your database</p>
        <p className="mt-1 leading-relaxed text-amber-900/90">
          Add Supabase keys to <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-xs">.env.local</code> and run the SQL migrations, then restart the app.
        </p>
      </div>
    </div>
  );
}
