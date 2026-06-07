import { NextRequest, NextResponse } from "next/server";
import { geocodeLocationFromNominatim } from "@/lib/geocode";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ ok: false, error: "Missing location query" }, { status: 400 });
  }

  const result = await geocodeLocationFromNominatim(q);
  if (!result) {
    return NextResponse.json({ ok: false, error: "Location not found in Fiji" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, result });
}
