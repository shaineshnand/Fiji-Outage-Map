export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startEflCrawlerScheduler } = await import("@/lib/efl-crawler/scheduler");
  startEflCrawlerScheduler();
}
