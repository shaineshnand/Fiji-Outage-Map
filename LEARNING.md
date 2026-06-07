# Learning guide — Fiji Outage Map

---

## 1. How the pieces connect

```
EFL website ──► crawler (backend) ──► planned_outages
Users ──► report form ──► outages
                │
                ▼
         useOutageIntel (cluster + confidence)
                │
                ▼
            Map + feed
```

- **Next.js app** = map + community report form only
- **Crawler** = separate script (see `scripts/efl-crawler/`) — not in the browser
- **Supabase** = stores both tables

---

## 2. Folder structure

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Home — map, report form, feed |
| `src/hooks/useOutageIntel.ts` | Loads both sources, clustering |
| `src/lib/clustering.ts` | Groups nearby reports |
| `src/lib/confidence.ts` | 20% / 55% / 85% scores |
| `scripts/efl-crawler/` | Where you build the EFL crawler |
| `supabase/migration-v2-dual-source.sql` | `planned_outages` table |

---

## 3. Two data sources

| Source | Table | Who writes |
|--------|-------|------------|
| EFL planned | `planned_outages` | Web crawler (server) |
| Community | `outages` | Users in the app |

---

## 4. Map layers

| Color | Meaning |
|-------|---------|
| Blue | Planned (EFL) |
| Red | Unplanned, high confidence |
| Orange | Unplanned, low confidence |
| Grey | Cleared / expired |

---

## 5. Commands

```bash
npm install
npm run dev
npm run dev:clean   # if dev server acts up
```

---

## 6. Next thing to build

The **EFL web crawler** — a scheduled Node or Python job that parses the EFL site and inserts into `planned_outages`. The map app already reads that table.

See `scripts/efl-crawler/README.md`.
