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

### 4. Automatic EFL sync (every 30 minutes)

Planned outages sync via **GitHub Actions** — not while you run `npm run dev`.

1. Push the repo to GitHub.
2. Add **Actions secrets**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (see [`scripts/efl-crawler/README.md`](scripts/efl-crawler/README.md)).
3. The workflow runs every **30 minutes**; trigger once manually under **Actions → EFL Crawler** to load data immediately.

For a one-off local test: `npm run crawl:efl`

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
