# Fiji Outage Map

Geospatial outage intelligence for Fiji — **EFL planned outages** (automated crawler) plus **community reports** on a live map.

Built with **Next.js**, **Leaflet**, and **Supabase**.

## Features

- **4-layer map**: planned (blue), active reported (red), unconfirmed (orange), cleared (grey)
- **EFL planned data** — synced from the official website via a backend crawler (not user uploads)
- **Community reports** — location, issue type, optional description, map pick
- **Clustering + confidence scoring** for unplanned outages
- Live feed with filters (all / planned / community)
- Mobile-friendly UI

## Data sources

| Source | How it gets in |
|--------|----------------|
| Planned (EFL) | Web crawler → `planned_outages` — see [`scripts/efl-crawler/README.md`](scripts/efl-crawler/README.md) |
| Community | User report form → `outages` |

## Quick start

### 1. Install

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` → `.env.local` and set your Supabase URL and publishable key.
3. Run [`supabase/schema.sql`](supabase/schema.sql) then [`supabase/migration-v2-dual-source.sql`](supabase/migration-v2-dual-source.sql).
4. Enable **Realtime** on `outages` and `planned_outages`.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Automatic EFL sync

**Local (`npm run dev`):** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` — syncs every 30 minutes while the server runs.

**Vercel Hobby (free):** Vercel cron is **once per day only**, so use a free external scheduler for every 30 minutes:

1. Deploy to [Vercel](https://vercel.com) and add env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET` — any long random string you make up
2. Sign up at [cron-job.org](https://cron-job.org) (free).
3. Create a cron job:
   - **URL:** `https://YOUR-APP.vercel.app/api/cron/efl`
   - **Schedule:** every **30 minutes**
   - **Request header:** `Authorization` = `Bearer YOUR_CRON_SECRET` (same as `CRON_SECRET` in Vercel)
4. Run once manually to test — you should get JSON like `{ "ok": true, "upserted": 22, ... }`.

`vercel.json` also includes a **daily backup** cron. First deploy may take ~2 minutes to geocode; later runs reuse saved coordinates and finish faster.

Manual run anytime: `npm run crawl:efl`

## Docs

- **[SYSTEM_DESIGN.md](SYSTEM_DESIGN.md)** — final architecture
- **[LEARNING.md](LEARNING.md)** — coding walkthrough

## Project structure

```
src/                 # Next.js app (map + report form)
scripts/efl-crawler/ # Crawler documentation (backend job)
supabase/            # SQL schema + migrations
```

## Disclaimer

Community data is crowdsourced. Planned data is structured from public EFL information via automation — not an official EFL product.
