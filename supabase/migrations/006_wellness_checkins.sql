create table public.wellness_checkins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  logged_date date not null default current_date,
  mood integer not null check (mood between 1 and 5),
  energy integer not null check (energy between 1 and 5),
  created_at timestamptz default now()
);

alter table public.wellness_checkins enable row level security;

create policy "Users can manage own wellness checkins"
  on public.wellness_checkins for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index idx_wellness_checkins_user_date
  on public.wellness_checkins (user_id, logged_date desc);
