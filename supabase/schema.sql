-- Run this in Supabase Dashboard → SQL Editor → New query → Run
--
-- WHAT THIS DOES (learning):
-- 1. Creates a custom ENUM type for allowed status/source values (data integrity)
-- 2. Creates the `outages` table — one row = one outage report
-- 3. Enables Row Level Security (RLS) so only allowed operations work
-- 4. Adds policies so the public app can read and insert (no auth in v1)

-- Status values match the app logic
create type outage_status as enum (
  'active',
  'suspected_resolved',
  'resolved'
);

create type outage_source as enum (
  'user_report',
  'manual',
  'image_upload'
);

create type issue_type as enum (
  'no_power',
  'partial_outage'
);

create table if not exists public.outages (
  id uuid primary key default gen_random_uuid(),
  location text not null,
  status outage_status not null default 'active',
  issue_type issue_type not null default 'no_power',
  time_reported timestamptz not null default now(),
  source outage_source not null default 'user_report',
  description text,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for sorting the live feed by newest first
create index if not exists outages_time_reported_idx
  on public.outages (time_reported desc);

-- Auto-update `updated_at` on every row change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger outages_updated_at
  before update on public.outages
  for each row execute function public.set_updated_at();

alter table public.outages enable row level security;

-- Anyone can read outages (public map)
create policy "Public read outages"
  on public.outages for select
  using (true);

-- Anyone can submit a report (v1 — add auth later if you want)
create policy "Public insert outages"
  on public.outages for insert
  with check (true);

-- Optional: allow updates for status refresh (cron or app)
create policy "Public update outages"
  on public.outages for update
  using (true);

-- Realtime: enable in Dashboard → Database → Replication → outages

-- Sample data for testing (Fiji coordinates)
insert into public.outages (location, status, issue_type, source, description, latitude, longitude, time_reported)
values
  ('Suva', 'active', 'no_power', 'manual', 'CBD area — transformer issue', -18.1416, 178.4419, now() - interval '2 hours'),
  ('Nadi', 'suspected_resolved', 'partial_outage', 'user_report', 'Intermittent power', -17.7765, 177.4356, now() - interval '30 hours'),
  ('Lautoka', 'resolved', 'no_power', 'manual', 'Restored overnight', -17.6161, 177.4665, now() - interval '80 hours');
