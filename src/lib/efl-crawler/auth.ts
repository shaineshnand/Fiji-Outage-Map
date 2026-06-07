import type { NextRequest } from "next/server";

/** Vercel Cron and external schedulers send Authorization: Bearer <CRON_SECRET> */
export function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (secret) {
    return auth === `Bearer ${secret}`;
  }

  // Local dev only — never allow unauthenticated cron on Vercel
  return process.env.VERCEL !== "1";
}

export function cronAuthError(): string | null {
  if (process.env.VERCEL === "1" && !process.env.CRON_SECRET) {
    return "Set CRON_SECRET in Vercel environment variables";
  }
  return null;
}
