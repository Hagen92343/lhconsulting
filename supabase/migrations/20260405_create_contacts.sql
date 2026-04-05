create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  locale text default 'de',
  created_at timestamptz default now()
);

-- RLS: allow anonymous inserts only
alter table public.contacts enable row level security;

create policy "Allow anonymous inserts"
  on public.contacts
  for insert
  to anon
  with check (true);

-- No select/update/delete for anon
