# EFL planned outage crawler

Pulls the official **Planned Outages** table from Energy Fiji Limited and syncs it to Supabase.

**Source page:** https://efl.com.fj/about-us/outages-disruptions/planned-outages/

| EFL column   | We store as        |
|--------------|--------------------|
| Region       | `region` + map label |
| Area         | `affected_area` + `reason` |
| Start Time   | `start_time`       |
| End time     | `end_time`         |

Coordinates come from **OpenStreetMap Nominatim** (Fiji-bounded geocode).

---

## Setup (one time)

### 1. Database migration

In Supabase SQL Editor, run:

`supabase/migration-v3-crawler-fields.sql`

(after `schema.sql` and `migration-v2-dual-source.sql`)

### 2. Service role key

The crawler needs the **service role** key (not the publishable key):

1. Supabase → **Project Settings** → **API**
2. Copy **service_role** secret
3. Add to `.env.local` in the **project root**:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...your-service-role-key
```

Your existing `NEXT_PUBLIC_SUPABASE_URL` is used automatically.

### 3. Install crawler dependencies

```bash
cd scripts/efl-crawler
npm install
```

---

## Run the crawler

From project root:

```bash
npm run crawl:efl:dry
```

Preview parsing + geocoding **without** writing to the database.

```bash
npm run crawl:efl
```

Live sync: upsert rows, remove outages no longer listed on EFL.

---

## Automatic sync (every 30 minutes)

This repo includes **GitHub Actions** (`.github/workflows/efl-crawler.yml`) that runs the crawler **every 30 minutes** once configured:

1. Push this repo to **GitHub**
2. **Settings → Secrets and variables → Actions → New repository secret**
   - `SUPABASE_URL` — same value as `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
   - `SUPABASE_SERVICE_ROLE_KEY` — from Supabase → Project Settings → API → service_role
3. **Actions** tab → enable workflows if prompted
4. Optional: **Actions → EFL Crawler → Run workflow** to test immediately

The map app reads Supabase only; it does not run the crawler. After secrets are set, planned outages stay fresh without manual runs.

Respect Nominatim: **1 geocode per second** (built into the crawler).

---

## How it works

```
EFL HTML table → parse (cheerio) → geocode each region → upsert planned_outages
```

Each row gets a stable `external_id` (hash of region + times + area) so re-runs update instead of duplicate.
