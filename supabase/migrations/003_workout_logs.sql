-- Workout logs: one row per completed workout session
create table public.workout_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  started_at timestamptz not null,
  finished_at timestamptz not null default now(),
  created_at timestamptz default now()
);

-- Workout log sets: one row per logged set
create table public.workout_log_sets (
  id uuid default gen_random_uuid() primary key,
  workout_log_id uuid not null references public.workout_logs(id) on delete cascade,
  movement_id uuid not null references public.movements(id),
  exercise_order integer not null,
  set_order integer not null,
  reps integer,
  weight_kg numeric(6, 2),
  completed boolean not null default false,
  created_at timestamptz default now()
);

-- RLS
alter table public.workout_logs enable row level security;
alter table public.workout_log_sets enable row level security;

create policy "Users can manage own workout logs"
  on public.workout_logs for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can manage own workout sets"
  on public.workout_log_sets for all
  to authenticated
  using (
    workout_log_id in (
      select id from public.workout_logs where user_id = auth.uid()
    )
  )
  with check (
    workout_log_id in (
      select id from public.workout_logs where user_id = auth.uid()
    )
  );

-- Indexes
create index idx_workout_logs_user on public.workout_logs (user_id, created_at desc);
create index idx_workout_log_sets_log on public.workout_log_sets (workout_log_id);
