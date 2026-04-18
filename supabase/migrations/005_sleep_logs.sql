create table public.sleep_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  logged_date date not null default current_date,
  sleep_start timestamptz not null,
  sleep_end timestamptz not null,
  quality integer not null check (quality between 1 and 5),
  created_at timestamptz default now()
);

alter table public.sleep_logs enable row level security;

create policy "Users can manage own sleep logs"
  on public.sleep_logs for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index idx_sleep_logs_user_date
  on public.sleep_logs (user_id, logged_date desc);
