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

  try {
    const result = await runEflCrawl({ quiet: true });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Crawl failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
