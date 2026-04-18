create table public.nutrition_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  logged_date date not null default current_date,
  meal_name text not null,
  calories integer,
  protein_g numeric(6, 1),
  carbs_g numeric(6, 1),
  fat_g numeric(6, 1),
  created_at timestamptz default now()
);

alter table public.nutrition_logs enable row level security;

create policy "Users can manage own nutrition logs"
  on public.nutrition_logs for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index idx_nutrition_logs_user_date
  on public.nutrition_logs (user_id, logged_date desc);
