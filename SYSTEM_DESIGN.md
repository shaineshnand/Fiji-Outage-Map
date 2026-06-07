# Fiji Outage Map — Final System Design

## What you are building

A **geospatial outage intelligence system** that fuses:

1. **Official planned outage data** — ingested from the **EFL website by a web crawler** (backend job)
2. **Community-reported outages** — simple user form (location + description)

No image upload. No manual EFL entry in the app.

---

## Architecture

```
┌──────────────────┐
│ EFL website      │
└────────┬─────────┘
         │ web crawler (scheduled, server-side)
         ▼
┌──────────────────┐     ┌─────────────────────┐
│ planned_outages  │     │ outages (community) │
└────────┬─────────┘     └──────────┬──────────┘
         │                          │
         └──────────┬───────────────┘
                    ▼
         ┌──────────────────────┐
         │ Processing layer     │
         │ · clustering         │
         │ · confidence scoring │
         └──────────┬───────────┘
                    ▼
         ┌──────────────────────┐
         │ Map (4 layers)       │
         │ + live feed          │
         └──────────────────────┘
```

---

## Data sources (only 2)

| Source | Table | How data enters |
|--------|-------|------------------|
| **A — Planned (EFL)** | `planned_outages` | **Web crawler** → Supabase (see `scripts/efl-crawler/`) |
| **B — Community** | `outages` | **User report form** on the map app |

---

## Map layers

| Layer | Color | Meaning |
|-------|-------|---------|
| **Planned** | Blue | EFL scheduled window (from crawler) |
| **Active reported** | Red | Unplanned, confidence ≥ 55% |
| **Unconfirmed** | Orange | Low confidence (1–2 reports) |
| **Cleared** | Grey | Expired window or old reports |

---

## Confidence (community only)

| Reports in cluster | Confidence |
|--------------------|------------|
| 1 | 20% |
| 3 | 55% |
| 5+ | 85% |

---

## Key folders

| Path | Role |
|------|------|
| `scripts/efl-crawler/` | EFL web crawler (`npm run crawl:efl`) |
| `src/hooks/useOutageIntel.ts` | Load + process both sources |
| `src/components/ReportForm.tsx` | Community reports only |
| `src/components/EflDataInfo.tsx` | UI note: EFL = crawler |

---

## Database setup

1. `supabase/schema.sql`
2. `supabase/migration-v2-dual-source.sql`
3. Realtime on `outages` and `planned_outages`

Sample planned rows in migration are for **testing** until the crawler runs.
