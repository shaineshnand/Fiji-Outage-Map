import { runEflCrawl } from "./run";

const INTERVAL_MS = 30 * 60 * 1000;
const STARTUP_DELAY_MS = 15_000;

const globalState = globalThis as typeof globalThis & {
  __eflCrawlerSchedulerStarted?: boolean;
  __eflCrawlerRunning?: boolean;
};

function isSchedulerEnabled(): boolean {
  // Vercel serverless has no long-lived process — use /api/cron/efl + external cron
  if (process.env.VERCEL === "1") return false;
  if (process.env.EFL_CRON_ENABLED === "false") return false;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return false;
  return true;
}

async function runOnce(): Promise<void> {
  if (globalState.__eflCrawlerRunning) {
    console.log("[EFL crawler] Skipping — previous run still in progress");
    return;
  }

  globalState.__eflCrawlerRunning = true;
  try {
    await runEflCrawl({ quiet: true });
  } catch (err) {
    console.error("[EFL crawler] Scheduled run failed:", err);
  } finally {
    globalState.__eflCrawlerRunning = false;
  }
}

export function startEflCrawlerScheduler(): void {
  if (globalState.__eflCrawlerSchedulerStarted) return;
  if (!isSchedulerEnabled()) {
    if (process.env.VERCEL === "1") {
      console.log("[EFL crawler] On Vercel — use /api/cron/efl (see README Vercel section)");
    } else {
      console.log(
        "[EFL crawler] Auto-sync off — set SUPABASE_SERVICE_ROLE_KEY in .env.local (or EFL_CRON_ENABLED=false to silence)"
      );
    }
    return;
  }

  globalState.__eflCrawlerSchedulerStarted = true;
  console.log("[EFL crawler] Auto-sync enabled — every 30 minutes while the server runs");

  setTimeout(() => {
    void runOnce();
  }, STARTUP_DELAY_MS);

  setInterval(() => {
    void runOnce();
  }, INTERVAL_MS);
}
