-- Crawler metadata for planned_outages (run after migration-v2)

alter table public.planned_outages
  add column if not exists external_id text unique;

alter table public.planned_outages
  add column if not exists region text;

alter table public.planned_outages
  add column if not exists affected_area text;

alter table public.planned_outages
  add column if not exists scraped_at timestamptz;

create index if not exists planned_outages_external_id_idx
  on public.planned_outages (external_id);

-- Crawler uses service_role key (bypasses RLS). Optional: restrict inserts to service role only later.
