import { waitUntil } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";
import { cronAuthError, isCronAuthorized } from "@/lib/efl-crawler/auth";
import { runEflCrawl } from "@/lib/efl-crawler/run";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const configError = cronAuthError();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 500 });
  }

  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const runInBackground = () =>
    runEflCrawl({ quiet: true }).catch((err) => {
      console.error("[EFL crawler] Background run failed:", err);
    });

  // cron-job.org free plan times out after 30s — respond immediately on Vercel
  if (process.env.VERCEL === "1") {
    waitUntil(runInBackground());
    return NextResponse.json({
      ok: true,
      status: "started",
      message: "EFL sync running in background (up to 5 min on Vercel)",
    });
  }

  try {
    const result = await runEflCrawl({ quiet: true });
    return NextResponse.json({ ok: true, status: "completed", ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Crawl failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
