"use client";

import dynamic from "next/dynamic";

const OutageMap = dynamic(() => import("./OutageMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-sky-100 to-cyan-50">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-teal-200 border-t-teal-600" />
      </div>
      <p className="text-sm font-medium text-slate-600">Loading Fiji map…</p>
    </div>
  ),
});

export default OutageMap;
