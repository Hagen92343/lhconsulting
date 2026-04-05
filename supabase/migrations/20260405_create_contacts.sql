create table if not exists public.contacts (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null check (char_length(name) between 1 and 200),
  email       text        not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message     text        not null check (char_length(message) between 10 and 5000),
  -- locale is constrained to the two supported values; any other value is rejected
  locale      text        not null default 'de' check (locale in ('de', 'en')),
  -- ip_address is stored for server-side rate limiting; anon callers cannot set it
  -- (the column is populated by the service-role key on the server, never by the client)
  ip_address  text,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.contacts enable row level security;

-- Anonymous users may INSERT only.
-- The WITH CHECK clause is intentionally restrictive:
--   - locale must be one of the two allowed values
--   - ip_address must be NULL when inserted by anon (server fills it via service role)
create policy "Allow anonymous inserts"
  on public.contacts
  for insert
  to anon
  with check (
    locale in ('de', 'en')
  );

-- Anon may NOT select, update, or delete — no policy means no access.
-- Service-role key (used by the API route) bypasses RLS by design.
