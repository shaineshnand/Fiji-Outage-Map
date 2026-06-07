-- Run AFTER schema.sql (or on existing project)
-- Dual-source: EFL planned outages (web crawler) + community reports (user form)

-- ─── Source A: Planned outages (EFL) ───
create table if not exists public.planned_outages (
  id uuid primary key default gen_random_uuid(),
  location text not null,
  latitude double precision not null,
  longitude double precision not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists planned_outages_time_idx
  on public.planned_outages (start_time desc, end_time desc);

create trigger planned_outages_updated_at
  before update on public.planned_outages
  for each row execute function public.set_updated_at();

alter table public.planned_outages enable row level security;

create policy "Public read planned outages"
  on public.planned_outages for select using (true);

create policy "Public insert planned outages"
  on public.planned_outages for insert with check (true);

-- Enable Realtime for planned_outages in Dashboard → Replication

-- Sample EFL-style planned outages
insert into public.planned_outages (location, latitude, longitude, start_time, end_time, reason)
values
  (
    'Suva CBD',
    -18.1416,
    178.4419,
    now() + interval '1 day',
    now() + interval '1 day 6 hours',
    'Scheduled maintenance — substation upgrade'
  ),
  (
    'Nadi Airport Road',
    -17.7765,
    177.4356,
    now() - interval '2 hours',
    now() + interval '4 hours',
    'Planned line work'
  );
