create extension if not exists pgcrypto;

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  username text not null check (char_length(trim(username)) between 1 and 40),
  answers jsonb not null,
  dimension_scores jsonb not null,
  total_score integer not null check (total_score between 16 and 80),
  report jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.response_events (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.responses(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.responses enable row level security;
alter table public.response_events enable row level security;

drop policy if exists "response events are visible for realtime" on public.response_events;
create policy "response events are visible for realtime"
  on public.response_events
  for select
  to anon, authenticated
  using (true);

do $$
begin
  alter publication supabase_realtime add table public.response_events;
exception
  when duplicate_object then null;
end $$;
